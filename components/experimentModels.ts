import { capacitorDroop, current, dividerModel, ldoPower, ledResistor, parallel, rcVoltage, riseTime, switchModel } from "./math";

export type Field = { key: string; label: string; unit: string; initial: number; min: number; max: number; step: number; alternateOnly?: boolean };
export type Values = Record<string, number>;
export type Metric = [label: string, value: string];
export type Model = {
  id: string; title: string; description: string; fields: Field[]; modes?: [string, string];
  equation: string; alternateEquation?: string; observation: string; limits: string; source: [string, string];
  metrics: (v: Values, alternate: boolean) => Metric[];
  warning?: (v: Values) => string | undefined;
};
const field = (key: string, label: string, unit: string, initial: number, min: number, max: number, step: number): Field =>
  ({key, label, unit, initial, min, max, step});
const supply = field("vs", "Supply voltage", "V", 3.3, 0.1, 12, 0.1);
const upper = field("r1", "Upper resistor R1", "kΩ", 10, 0.1, 100, 0.1);
const lower = field("r2", "Lower resistor R2", "kΩ", 10, 0.1, 100, 0.1);
const resistance = field("r", "Resistance", "kΩ", 1, 0.1, 20, 0.1);
const pullup = field("r", "Pull-up resistor", "kΩ", 4.7, 0.1, 20, 0.1);
const textbook: [string, string] = ["OpenStax · Resistors in series and parallel", "https://openstax.org/books/university-physics-volume-2/pages/10-2-resistors-in-series-and-parallel"];
const i2c: [string, string] = ["Texas Instruments · I²C pull-up resistor calculation", "https://www.ti.com/lit/an/slva689/slva689.pdf"];
export function format(n: number, unit = "") {
  const value = Number(n.toPrecision(4));
  return String(value) + (unit ? " " + unit : "");
}

// Keep four significant figures while rounding a design bound toward safety.
function roundedBound(value: number, direction: "up" | "down") {
  const scale = 10 ** (3 - Math.floor(Math.log10(value)));
  const scaled = value * scale;
  return (direction === "up" ? Math.ceil(scaled) : Math.floor(scaled)) / scale;
}

function i2cMetrics(v: Values): Metric[] {
  const nsPerKohm = riseTime(1000, v.cb * 1e-12) * 1e9;
  const minTiming = 20 / nsPerKohm;
  const maxTiming = 300 / nsPerKohm;
  const minSink = (3.3 - 0.4) / 3; // V / mA = kΩ
  const lower = Math.max(minTiming, minSink);
  let displayedMin = roundedBound(lower, "up");
  let displayedMax = roundedBound(maxTiming, "down");
  if (lower <= maxTiming && displayedMin > displayedMax) {
    // A narrow feasible interval needs more than four figures to stay usable.
    displayedMin = lower;
    displayedMax = maxTiming;
  }
  const violations: string[] = [];
  if (v.r < minTiming) violations.push("Rise faster than 20 ns");
  if (v.r > maxTiming) violations.push("Rise slower than 300 ns");
  if (v.r < minSink) violations.push("Exceeds sink-current budget");
  const status = lower > maxTiming
    ? "No feasible passive pull-up at this capacitance and sink rating"
    : violations.join(" · ") || "Meets the rise-time and sink-current limits";
  return [
    ["Rise time", Number((nsPerKohm * v.r).toFixed(4)) + " ns"],
    ["Minimum pull-up", displayedMin + " kΩ"],
    ["Maximum pull-up", displayedMax + " kΩ"],
    ["Fast-mode check", status],
  ];
}
export const models: Model[] = [
  {
    id: "divider", title: "Voltage divider", description: "Measure the divider tap, then connect a load and compare.",
    fields: [supply, upper, lower, {...field("rl","Load resistor RL","kΩ",10,0.1,1000,0.1),alternateOnly:true}],
    modes: ["Unloaded","Loaded"], equation: String.raw`V_{\mathrm{out}}=V_{\mathrm{in}}\frac{R_2}{R_1+R_2}`,
    alternateEquation: String.raw`R_b=R_2\parallel R_L,\quad V_{\mathrm{out}}=V_{\mathrm{in}}\frac{R_b}{R_1+R_b}`,
    observation: "Connect RL between the tap and ground. Current splits between R2 and RL, pulling the tap voltage down. Try reducing RL to see the voltage drop further while supply current increases.",
    limits: "The source resistance is the resistance seen looking back into the tap with RL disconnected and the ideal voltage source set to 0 V (shorted). It equals R1 ∥ R2 in both modes. RL represents a steady resistive load. An ADC sampling capacitor draws transient current that this DC model omits.", source: textbook,
    metrics: (v,loaded) => {
      const result=dividerModel(v.vs,v.r1,v.r2,loaded?v.rl:undefined);
      const metrics: Metric[]=[["Output voltage",format(result.tap,"V")],["Supply current",format(result.supplyCurrent,"mA")],["Source resistance",format(result.sourceResistance,"kΩ")]];
      if (loaded) metrics.push(["Load current",format(result.loadCurrent,"mA")]);
      return metrics;
    }
  },
  {
    id: "rc", title: "RC charge & discharge", description: "Probe the capacitor voltage as charge moves through a resistor.",
    fields: [supply, {...resistance, initial:10}, field("c", "Capacitance", "µF", 1, 0.1, 100, 0.1), field("probe", "Probe time", "τ", 1, 0, 5, 0.1)],
    modes: ["Charge","Discharge"], equation: String.raw`V_C(t)=V_f+(V_i-V_f)e^{-t/(RC)}`,
    observation: "At one time constant the capacitor has traversed 63.2% of the gap between its initial and final voltages. Doubling R or C doubles the time required.",
    limits: "An ideal step drives a linear RC network. Leakage, capacitor ESR and source resistance are omitted.", source: i2c,
    metrics: (v, discharging) => [["Probe voltage",format(rcVoltage(discharging?v.vs:0,discharging?0:v.vs,v.probe,1),"V")],["Time constant",format(v.r*v.c,"ms")],["Probe time",format(v.probe*v.r*v.c,"ms")]]
  },
  {
    id: "ohm", title: "Ohm’s law", description: "Measure the current through a resistor on a DC rail.",
    fields: [supply,resistance], equation: String.raw`I=\frac VR`,
    observation: "Double the voltage across this resistor and its current doubles. Double the resistance at the same voltage and the current halves.",
    limits: "Uses a constant resistance and a supply with unlimited current capability. A GPIO output has finite output resistance.", source: textbook,
    metrics: v => [["Load current",format(current(v.vs,v.r),"mA")],["Power",format(v.vs*v.vs/v.r,"mW")]]
  },
  {
    id: "resistors", title: "Series & parallel resistors", description: "Compare the resistance seen between two test points.",
    fields: [{...upper,label:"Resistor R1"},{...lower,label:"Resistor R2"}], modes:["Series","Parallel"],
    equation: String.raw`R_s=R_1+R_2,\quad R_p=\frac{R_1 R_2}{R_1+R_2}`,
    observation: "A series connection offers one path through both resistors. A parallel connection gives current a second path, so the equivalent resistance falls below either branch.",
    limits:"Ideal resistors with zero lead resistance. Actual component tolerance changes the result.", source:textbook,
    metrics:(v,par) => [["Equivalent resistance",format(par?parallel(v.r1,v.r2):v.r1+v.r2,"kΩ")]]
  },
  {
    id:"led", title:"LED current limiter", description:"Size a series resistor for an indicator LED.",
    fields:[supply,field("vf","LED forward voltage","V",2,1,4,0.1),field("ma","Target current","mA",5,0.1,30,0.1)], equation:String.raw`R=\frac{V_s-V_f}{I}`,
    observation:"The resistor drops the supply voltage left over after the LED’s forward drop. A higher target current needs a smaller resistor and dissipates more heat.",
    limits:"Uses a fixed LED forward drop at the target current. Check its tolerance, temperature dependence and driver output voltage.", source:["DigiKey · LED series resistor calculator","https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-led-series-resistor"],
    warning:v=>v.vs<=v.vf?"The supply must exceed the LED forward voltage to sustain the target current.":undefined,
    metrics:v=>[["Series resistance",format(ledResistor(v.vs,v.vf,v.ma/1000)!,"Ω")],["Resistor power",format((v.vs-v.vf)*v.ma,"mW")]]
  },
  {
    id:"mosfet", title:"MOSFET low-side switch", description:"Switch a resistive load with a logic-level N-channel MOSFET.",
    fields:[{...supply,initial:5},field("load","Load resistance","Ω",100,10,1000,1),field("ron","On resistance","mΩ",50,5,500,1)], modes:["Gate high","Gate low"],
    equation:String.raw`I_{\mathrm{on}}=\frac{V_s}{R_{\mathrm{load}}+R_{\mathrm{DS(on)}}}`,
    observation:"With the gate high, the transistor completes the path to ground. With the gate low, current stops and the drain rises to the supply through the load.",
    limits:"High assumes the gate voltage guarantees the selected on resistance. Gate threshold only indicates the beginning of conduction. This steady-state model omits switching loss and leakage.", source:["Infineon · MOSFET datasheet parameters","https://www.infineon.com/assets/row/public/documents/24/42/infineon-ds-explanation-update-applicationnotes-en.pdf"],
    metrics:(v,off)=>{const s=switchModel(v.vs,v.load,v.ron/1000,!off);return [["Load current",format(s.amps*1000,"mA")],["Drain voltage",format(s.drain,"V")],["MOSFET loss",format(s.watts*1000,"mW")]]}
  },
  {
    id:"drain", title:"Open-drain logic", description:"Follow a bus line when its output driver pulls low or releases it.",
    fields:[supply,pullup], modes:["Released","Pulling low"], equation:String.raw`I_{\mathrm{low}}\approx\frac{V_{\mathrm{DD}}}{R_p}`,
    observation:"A released driver leaves the pull-up to set the bus high. Pulling low creates a current path through the resistor. A smaller pull-up increases the low-state current.",
    limits:"Steady-state ideal switch. A real driver has nonzero VOL and limited sink current. Bus capacitance slows a rising edge.",source:i2c,
    metrics:(v,low)=>[["Bus voltage",format(low?0:v.vs,"V")],["Sink current",format(low?v.vs/v.r:0,"mA")]]
  },
  {
    id:"i2c",title:"I²C rise time",description:"Compare a passive pull-up with the Fast-mode rise-time budget.",
    fields:[{...pullup,max:40},field("cb","Bus capacitance","pF",100,10,400,1)],equation:String.raw`t_{30\text{–}70\%}=\ln(7/3)\,R_p C_{\mathrm{bus}}`,
    observation:"Extra devices and longer wiring add capacitance. Lowering the pull-up resistance speeds up the rising edge but requires more sink current when the line is low.",
    limits:"Fast-mode rise time is 20–300 ns (UM10204 Table 11). This first-order model assumes a 3.3 V passive pull-up, lumped bus capacitance, and a weakest sink rated for 3 mA at 0.4 V. Both timing and sink current constrain the minimum resistor. The slowest permitted rise sets the maximum. If the limits do not overlap, reduce capacitance or revisit the bus mode and device ratings. Allow for real component tolerances.",
    source:["NXP · I²C-bus specification, Table 11 and §7.1","https://www.nxp.com/docs/en/user-guide/UM10204.pdf"],
    metrics:i2cMetrics
  },
  {
    id:"power",title:"Resistor power rating",description:"Find the heat in a resistor and a target rating with design margin.",
    fields:[{...supply,initial:5},field("ohms","Resistance","Ω",220,10,1000,1),field("usage","Maximum rating used","%",50,10,100,1)],
    equation:String.raw`P=\frac{V^2}{R},\quad P_{\mathrm{rated}}\geq \frac{P}{u}`,
    observation:"Twice the voltage gives four times the heating in a fixed resistor. Limiting the fraction of the rating used leaves room for thermal margin.",
    limits:"The utilization factor u is the entered percentage divided by 100. For example, 50% gives u = 0.5. Select a rating at or above the displayed minimum after temperature derating. Check pulse and voltage ratings separately.",source:textbook,
    metrics:v=>{const p=v.vs**2/v.ohms;return [["Dissipation",format(p*1000,"mW")],["Target rating ≥",roundedBound(p*100/v.usage,"up")+" W"],["Current",format(v.vs/v.ohms*1000,"mA")]]}
  },
  {
    id:"ldo",title:"LDO thermal estimate",description:"Estimate regulator heat from supply headroom and load current.",
    fields:[{...supply,initial:5},field("out","Regulated output","V",3.3,0.8,5,0.1),field("ma","Load current","mA",100,1,500,1),field("theta","Thermal resistance","°C/W",65,10,250,1),field("amb","Ambient temperature","°C",25,0,85,1),field("tjMax","Junction operating limit","°C",125,85,200,1)],equation:String.raw`P\approx(V_{\mathrm{in}}-V_{\mathrm{out}})I_{\mathrm{load}},\quad T_j\approx T_a+P\theta_{\mathrm{JA}}`,
    observation:"Reducing input voltage while maintaining sufficient headroom reduces heat. The same silicon can run warmer on a board with less copper.",
    limits:"Assumes steady-state regulation, illustrative 0.2 V dropout, negligible quiescent current, and board-specific θJA. Replace the example 125 °C operating limit with the datasheet’s maximum recommended junction temperature. Thermal shutdown is device-specific.",
    source:["Texas Instruments · LDO thermals","https://www.ti.com/video/5845988024001"],
    warning:v=>{
      if (v.vs-v.out<0.2-1e-10) return "Insufficient headroom for the assumed 0.2 V dropout. The target output cannot be guaranteed.";
      const {watts,junction}=ldoPower(v.vs,v.out,v.ma/1000,v.amb,v.theta);
      if (junction>v.tjMax) {
        const budget=(v.tjMax-v.amb)/v.theta;
        return `Thermally infeasible at the selected ${v.tjMax} °C limit. Regulating this load would dissipate ${format(watts,"W")}. The modeled thermal budget is ${format(budget,"W")}. Reduce the load, input voltage, ambient temperature, or thermal resistance.`;
      }
    },
    metrics:v=>{const a=ldoPower(v.vs,v.out,v.ma/1000,v.amb,v.theta);return [["Power loss",format(a.watts,"W")],["Junction estimate",format(a.junction,"°C")],["Operating limit",format(v.tjMax,"°C")],["Efficiency",format(100*v.out/v.vs,"%")]]}
  },
  {
    id:"decoupling",title:"Decoupling transient",description:"Estimate how far a rail falls while a capacitor supports a load step.",
    fields:[field("ma","Additional load","mA",40,1,200,1),field("us","Support interval","µs",1,0.1,10,0.1),field("c","Effective capacitance","µF",1,0.1,47,0.1),field("esr","Capacitor ESR","mΩ",30,1,200,1)],
    equation:String.raw`\Delta V\approx\Delta I\cdot R_{\mathrm{ESR}}+\frac{\Delta I\cdot\Delta t}{C}`,
    observation:"ESR produces an immediate voltage step. Afterward, charge leaves the capacitor and its voltage falls with time. More effective capacitance reduces the second part.",
    limits:"A 3.3 V rail and a constant extra load supplied entirely by the capacitor for this interval. Ignores ESL, wiring inductance and regulator response; use effective capacitance at DC bias.",source:["Analog Devices · Bypass capacitor selection","https://www.analog.com/en/resources/analog-dialogue/articles/why-bypass-capacitor-choice-matters.html"],
    warning:v=>capacitorDroop(v.ma/1000,v.us*1e-6,v.c*1e-6,v.esr/1000)>=3.3?"The estimated droop exhausts the 3.3 V rail. Choose a shorter interval or larger capacitance.":undefined,
    metrics:v=>{const drop=capacitorDroop(v.ma/1000,v.us*1e-6,v.c*1e-6,v.esr/1000);return [["Rail droop",format(drop*1000,"mV")],["Final voltage",format(3.3-drop,"V")],["ESR step",format(v.ma*v.esr/1000,"mV")]]}
  }
];

export function evaluate(model: Model, values: Values, alternate = false): { metrics: Metric[]; issue?: string } {
  for (const f of model.fields.filter(field => !field.alternateOnly || alternate)) {
    if (!Number.isFinite(values[f.key]) || values[f.key] < f.min || values[f.key] > f.max) {
      return {metrics: [], issue: `Enter ${f.label.toLowerCase()} between ${f.min} and ${f.max} ${f.unit}.`};
    }
  }
  const issue = model.warning?.(values);
  return issue ? {metrics: [], issue} : {metrics: model.metrics(values, alternate)};
}
