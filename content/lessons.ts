export type LessonExperiment = "ohm" | "divider" | "rc" | "mosfet" | "power";

export interface Question {
  question: string;
  /** Omit options for a numeric answer. The question specifies its unit. */
  options?: string[];
  answer: string;
  explanation: string;
}

export interface Lesson {
  slug: string;
  title: string;
  module: number;
  minutes: number;
  intro: string;
  flow: string;
  formula: string;
  worked: string;
  experiment: LessonExperiment;
  experimentTask: string;
  firmware: string;
  mistake: string;
  summary: string;
  quiz: Question[];
  sources: { title: string; url: string }[];
}

const ohmLab = {
  title: "Analog Devices · An Ohm’s Law Experiment",
  url: "https://wiki.analog.com/university/courses/alm1k/intro/ohm-law-1",
};
const dividerLab = {
  title: "Analog Devices · Voltage and Current Dividers",
  url: "https://wiki.analog.com/university/courses/engineering_discovery/lab_13",
};
const rcLab = {
  title: "Analog Devices · Transient Response of an RC Circuit",
  url: "https://wiki.analog.com/university/courses/electronics/rc_transient_response",
};
const adcGuide = {
  title: "Microchip · ADC Acquisition Time",
  url: "https://developerhelp.microchip.com/xwiki/bin/view/products/data-converters/adc-specs/acquisition-time/",
};

export const lessons: Lesson[] = [
  {
    slug: "voltage",
    title: "Voltage",
    module: 1,
    minutes: 6,
    intro: "Every voltage reading answers a two-point question. On a schematic, a label such as 3V3 usually names the potential of that net relative to board ground. To find the voltage across a device, choose the two actual terminals.",
    flow: "Trace a divider from its supply through the upper resistor, past the midpoint, then through the lower resistor to ground. Both resistors carry the same steady current when the midpoint is unloaded. The potential falls in two steps along this path. A voltmeter across the upper resistor measures the first step.",
    formula: String.raw`V_{AB}=V_A-V_B`,
    worked: "VA and VB are the node potentials in volts, measured from the same reference. With A at 3.3 V and B at 1.1 V, a red probe on A and black probe on B reads +2.2 V. Swapping the probes changes the sign.",
    experiment: "divider",
    experimentTask: "Choose equal resistors. Predict the midpoint and the drop across the top resistor, then raise the input voltage. How do both drops change?",
    firmware: "A digital receiver interprets a signal relative to its own ground. For a UART cable, follow the signal and its return connection before investigating framing errors. Compare the receiving pin’s voltage with its input limits and logic thresholds.",
    mistake: "A sensor output measures 1.8 V at the sensor, yet the MCU reads LOW intermittently. Put the reference probe at the receiving ground and compare the result with the MCU’s guaranteed high-input level. A 1.8 V high may sit below that limit.",
    summary: "Name both measurement nodes and the probe polarity. Read the receiver’s guaranteed input levels. Include any difference between the transmitter and receiver grounds in the voltage budget.",
    quiz: [
      { question: "A is at 3.3 V and B is at 0.8 V relative to the same ground. What is VAB in volts?", answer: "2.5", explanation: "The red-to-black reading is 3.3 − 0.8 = 2.5 V." },
      { question: "Which measurement gives the drop across the upper divider resistor?", options: ["Supply to midpoint", "Supply to ground", "Midpoint to ground"], answer: "Supply to midpoint", explanation: "Place a probe on each end of the component. Supply to ground spans both resistors." },
      { question: "A sensor guarantees 1.8 V HIGH. The receiver requires at least 2.0 V for HIGH. What should the reviewer flag?", options: ["The receiver needs a faster clock", "The high-level guarantee is insufficient", "The trace has reversed current"], answer: "The high-level guarantee is insufficient", explanation: "The voltage at the receiver must meet VIH(min) under the specified loads and supply conditions. The stated guarantees leave a 0.2 V shortfall." },
    ],
    sources: [ohmLab, dividerLab, { title: "Texas Instruments · Logic-level compatibility", url: "https://www.ti.com/document-viewer/lit/html/SSZTBH2" }],
  },
  {
    slug: "current",
    title: "Current",
    module: 1,
    minutes: 7,
    intro: "Current tells you how quickly charge crosses a point. Follow one complete path from a source, through a load, and back to the source. An open switch breaks that path even when a voltmeter still shows the full supply across its contacts.",
    flow: "In a source-and-resistor loop, conventional current leaves the positive terminal, passes through the resistor and returns to the negative terminal. At steady state, the same charge per second enters and leaves the resistor. At a junction the incoming branch currents add up to the outgoing currents.",
    formula: String.raw`I_{\mathrm{avg}}=\frac{\Delta Q}{\Delta t},\qquad \sum I_{\mathrm{in}}=\sum I_{\mathrm{out}}`,
    worked: "I is in amperes, charge Q in coulombs and time t in seconds. A radio drawing 20 mA for 10 ms takes 0.020 × 0.010 = 0.0002 C, or 200 µC. If the MCU simultaneously draws 8 mA from the same rail, their combined rail current is 28 mA during that interval.",
    experiment: "ohm",
    experimentTask: "Choose a supply and resistance, then predict what happens to current if you double the resistance. Identify the return path on the diagram.",
    firmware: "Sleep measurements depend on everything attached to a rail. A 3.3 V pull-up held low through 1 kΩ draws approximately 3.3 mA, enough to dwarf a microcontroller’s sleep current. Audit pin states along with clock and peripheral settings.",
    mistake: "An ammeter connected across the supply creates a low-resistance path. Insert it in series with the branch being measured. Its internal shunt also introduces a voltage drop, which can matter on a low-voltage or pulsed load.",
    summary: "Trace the full loop. Add simultaneous branch currents for regulator sizing and integrate current over time for charge consumption. Check instrument burden voltage when measuring.",
    quiz: [
      { question: "An MCU draws 12 mA and a sensor draws 8 mA simultaneously from one rail. What is the total in mA?", answer: "20", explanation: "The regulator supplies both parallel branches, so the currents add to 20 mA." },
      { question: "Where should a current meter go to measure the sensor branch?", options: ["Across VDD and ground", "In series with the sensor supply", "Between two ground test points"], answer: "In series with the sensor supply", explanation: "The same branch current must pass through the meter and the sensor." },
      { question: "A sleeping board has a 1 kΩ pull-up to 3.3 V on a pin held LOW. What explains roughly 3.3 mA?", options: ["The pull-up feeds a path through the pin to ground", "Static inputs always draw 3.3 mA", "A disabled clock still toggles the pin"], answer: "The pull-up feeds a path through the pin to ground", explanation: "Most of the 3.3 V drops across the resistor. The sink pin completes the DC current path." },
    ],
    sources: [ohmLab, { title: "Analog Devices · Measuring Current with the ADALM1000", url: "https://wiki.analog.com/_media/university/tools/m1k/alice/alice_measuring-current.pdf" }],
  },
  {
    slug: "resistance",
    title: "Resistance",
    module: 1,
    minutes: 6,
    intro: "A resistor turns electrical energy into heat while setting the current for a given voltage drop. On an embedded board, the same two-terminal part can bias a boot pin, sense motor current or limit current through an indicator.",
    flow: "With a resistor directly across a DC source, current runs from the high-potential side toward the return. Increasing resistance at a fixed supply reduces that current. A resistor has no required orientation. Its tolerance, package and thermal environment affect how close its behavior is to the nominal value.",
    formula: String.raw`R=\frac{V_R}{I},\qquad P_R=I^2R=\frac{V_R^2}{R}`,
    worked: "R is resistance in ohms, VR is the drop in volts, I is in amperes and PR is the power dissipated in watts. A 1 kΩ resistor across 5 V takes 5 mA and dissipates 25 mW. Replacing it with 100 Ω raises dissipation to 250 mW.",
    experiment: "power",
    experimentTask: "Keep the voltage fixed and reduce resistance. Watch how power changes. Compare it with the resistor rating you would need at your board’s operating temperature.",
    firmware: "Pull-ups need enough strength to overcome input leakage and charge the node on time. A stronger pull-up also draws more current when firmware pulls the node low. Check the resistor value against both states of the pin.",
    mistake: "A reviewer chooses a 100 Ω, 0.125 W resistor as a test load across a 5 V rail. The resistor must dissipate 0.25 W, twice its rating. Check continuous and pulse ratings plus the manufacturer’s temperature derating curve.",
    summary: "Read resistance, tolerance and power rating separately. Compute dissipation from the actual voltage across the part. For a pull resistor, check leakage, timing and low-state current.",
    quiz: [
      { question: "A 2 kΩ resistor drops 4 V. What is the current in mA?", answer: "2", explanation: "4 V ÷ 2,000 Ω = 0.002 A, or 2 mA." },
      { question: "With a fixed voltage across one resistor, doubling R does what to heat dissipation?", options: ["Doubles it", "Halves it", "Leaves it constant"], answer: "Halves it", explanation: "P = V²/R, so twice the resistance yields half the power at fixed voltage." },
      { question: "A 100 Ω, 125 mW resistor continuously drops 5 V. Which review finding matters?", options: ["Its continuous dissipation exceeds the rating", "The resistor needs its terminals swapped", "Its current is only 0.05 mA"], answer: "Its continuous dissipation exceeds the rating", explanation: "5²/100 = 0.25 W, twice the stated 0.125 W rating even before derating." },
    ],
    sources: [ohmLab, { title: "Vishay · Resistor ratings and temperature derating", url: "https://www.vishay.com/en/landingpage/rifaq/" }],
  },
  {
    slug: "ohms-law",
    title: "Ohm’s Law",
    module: 1,
    minutes: 8,
    intro: "A single voltage measurement across a known resistor can tell you the current in an inaccessible branch. This is especially handy when a prototype has test pads but no convenient place to insert a meter.",
    flow: "Select one resistor and label both ends. For an ohmic resistor at roughly constant temperature, its end-to-end voltage changes in proportion to its current. In a series path, other devices can take part of the supply voltage. Find the drop on the resistor before dividing by its resistance.",
    formula: String.raw`V_R=IR,\qquad I=\frac{V_R}{R},\qquad R=\frac{V_R}{I}`,
    worked: "For a 3.3 V supply, an LED with a 2.0 V forward drop and an ideal low-side switch, the resistor gets 1.3 V. A 330 Ω resistor gives 1.3/330 = 3.94 mA. The LED’s actual forward voltage varies with current and temperature.",
    experiment: "ohm",
    experimentTask: "Model just the resistor in the worked example by using the voltage left over after the LED drop. Try a smaller drop across the resistor and predict the current change.",
    firmware: "A current-sense routine uses the same relationship in reverse. With a 0.1 Ω shunt, a measured 20 mV means 200 mA. Include amplifier gain, offset, ADC reference and resistor tolerance when converting counts into amperes.",
    mistake: "Using the whole 3.3 V supply in the LED example predicts 10 mA. Trace the loop voltage budget, including the LED drop and any GPIO output-low voltage. Use the relevant pin’s output specification at the expected sink current.",
    summary: "Write the voltage directly across the resistance, convert units, then solve. Use the appropriate device model for the rest of the loop. Check the inferred current against the driver and load limits.",
    quiz: [
      { question: "A 0.1 Ω sense resistor drops 15 mV. What branch current flows in mA?", answer: "150", explanation: "0.015 V ÷ 0.1 Ω = 0.15 A = 150 mA." },
      { question: "What voltage belongs in I = V/R for an LED’s series resistor?", options: ["The LED forward voltage", "The entire board supply in every case", "The measured drop across the resistor"], answer: "The measured drop across the resistor", explanation: "The resistor’s own terminal voltage sets its current. Other series elements use the remaining voltage." },
      { question: "A design replaces the LED’s resistor with a wire because PWM duty is only 5%. What is the fault?", options: ["PWM reverses the LED", "Peak current lacks a defined limit", "PWM guarantees a 5 mA peak"], answer: "Peak current lacks a defined limit", explanation: "Duty cycle changes average on-time. Each pulse still needs current control to keep the LED and pin within their pulse ratings." },
    ],
    sources: [ohmLab],
  },
  {
    slug: "capacitors",
    title: "Capacitors",
    module: 2,
    minutes: 9,
    intro: "A capacitor stores separated charge. Its terminal voltage records how much charge it holds, so it can briefly supply a changing load while the regulator and supply traces respond.",
    flow: "Apply a DC step through a resistor to an initially discharged capacitor. At first the resistor sees the full supply. As charge accumulates, the capacitor voltage rises, leaving less voltage across the resistor and therefore less charging current. On discharge, the stored charge flows back through the available path.",
    formula: String.raw`i=C\frac{dV_C}{dt},\qquad \tau=RC,\qquad V_C(t)=V_S(1-e^{-t/\tau})`,
    worked: "C is capacitance in farads, R in ohms and τ in seconds. For 10 kΩ and 100 nF, τ = 1 ms. After one time constant of a 3.3 V step, VC reaches about 2.09 V. The formula assumes a constant supply, zero initial voltage and an ideal capacitor.",
    experiment: "rc",
    experimentTask: "Double capacitance with resistance fixed. Compare the time needed to reach the same fraction of the supply during charging. Then inspect discharge from a charged starting point.",
    firmware: "A reset RC network can delay release until the pin crosses its input threshold. A local bypass capacitor helps a processor meet short current demands. For a first droop estimate, a 10 mA deficit for 1 µs across 100 nF gives ΔV = IΔt/C = 0.1 V. Real ESR, trace inductance and effective capacitance change the result.",
    mistake: "A reset delay labeled 1 ms because RC = 1 ms may release sooner or later. Check the actual reset threshold, pulse width, supply ramp and reset-pin requirements. A slow supply ramp can invalidate a step-response estimate.",
    summary: "Current changes capacitor voltage. One time constant covers about 63% of the distance from the initial to final voltage. Use effective capacitance at bias and check the component and MCU specifications.",
    quiz: [
      { question: "For R = 10 kΩ and C = 220 nF, what is τ in milliseconds?", answer: "2.2", explanation: "10,000 × 220 × 10⁻⁹ s = 0.0022 s = 2.2 ms." },
      { question: "Immediately after a step into an initially discharged series RC, where is most of the voltage?", options: ["Across the resistor", "Across the capacitor", "Equally divided for any R and C"], answer: "Across the resistor", explanation: "Capacitor voltage starts at zero and rises continuously with finite current, so the initial resistor drop equals the supply step." },
      { question: "A review note promises reset releases exactly at RC. Which information is missing?", options: ["The firmware compiler version", "The reset threshold and supply ramp", "The resistor’s orientation"], answer: "The reset threshold and supply ramp", explanation: "The release time follows the threshold crossing and actual supply waveform. RC alone specifies an exponential time scale." },
    ],
    sources: [rcLab, { title: "Analog Devices · Power-on reset and supply supervision", url: "https://www.analog.com/en/resources/technical-articles/poweron-reset-and-related-supervisory-functions.html" }],
  },
  {
    slug: "voltage-dividers",
    title: "Voltage Dividers",
    module: 3,
    minutes: 8,
    intro: "Two resistors can scale a battery or sensor voltage into an ADC’s input range. Start by finding the resistor connected between the measurement node and ground. Its share of the total resistance sets the unloaded output fraction.",
    flow: "R1 connects VIN to the midpoint, and R2 connects the midpoint to ground. With the tap unloaded, the same current flows through both. Multiplying it by R2 gives the tap voltage. To find the resistance seen by a load, disconnect the load and replace the ideal supply with a short. R1 and R2 now appear in parallel. If the supply has series resistance Rs, the upper branch becomes R1 + Rs.",
    formula: String.raw`V_{out}=V_{in}\frac{R_2}{R_1+R_2},\qquad R_{source}=\frac{R_1R_2}{R_1+R_2}`,
    worked: "With VIN = 5 V, R1 = 20 kΩ and R2 = 10 kΩ, VOUT = 1.67 V and the effective source resistance is 6.67 kΩ. A 10 kΩ load from the midpoint to ground makes the lower leg 5 kΩ. The loaded output falls to 5 × 5/(20 + 5) = 1 V.",
    experiment: "divider",
    experimentTask: "Set the upper resistor to twice the lower resistor and predict one-third of VIN. Scale both resistances by the same factor, then compare the ratio and divider current. Connect a load equal to the lower resistor and predict the new tap voltage before reading it.",
    firmware: "A typical MCU successive-approximation (SAR) ADC briefly connects a sample-and-hold capacitor to its input. After switching channels, the capacitor may start near the previous channel’s voltage. Allow it to settle through the divider and the ADC’s internal switch during the programmed acquisition time. Check the input model and source-impedance limit for the actual ADC.",
    mistake: "Using a divider as a sensor supply makes its output depend on sensor current. A DMM can show the intended voltage with the sensor disconnected, then the rail collapses under load. Review the divider as a source with finite output resistance.",
    summary: "Use the lower leg in the numerator. Check the maximum input and resistor tolerances against the ADC range. Include loading, leakage and sampling time whenever the divider feeds a real input.",
    quiz: [
      { question: "VIN = 9 V, R1 = 20 kΩ above the tap and R2 = 10 kΩ below. What is the unloaded output in volts?", answer: "3", explanation: "The lower resistor is one-third of 30 kΩ, so the midpoint is one-third of 9 V." },
      { question: "Both resistances increase tenfold with the ratio unchanged. What changes?", options: ["The unloaded voltage increases tenfold", "Source resistance rises tenfold", "Divider current increases tenfold"], answer: "Source resistance rises tenfold", explanation: "The ratio stays fixed and current falls tenfold. The parallel combination R1 ∥ R2 becomes ten times larger." },
      { question: "A meter reads the expected divider voltage, but a SAR ADC reads low after switching from a lower-voltage channel. What should you check?", options: ["The resistor symbol style", "The ADC acquisition time and source impedance", "The byte order of the PCB traces"], answer: "The ADC acquisition time and source impedance", explanation: "The sample capacitor needs time to settle through the divider and internal sampling switch. A meter’s steady reading misses that transient." },
    ],
    sources: [dividerLab, adcGuide],
  },
  {
    slug: "mosfets",
    title: "MOSFETs",
    module: 4,
    minutes: 10,
    intro: "A GPIO can control a much larger current by charging the gate of an external MOSFET. In a low-side N-channel switch, the load receives power from its own supply and the MOSFET connects its return to ground.",
    flow: "Follow the load path from supply to load, through drain and source, then to ground. Raising the gate above the source gradually turns on the enhancement-mode channel. Choose a gate drive for which the datasheet guarantees sufficiently low on-resistance. During a transition the GPIO charges or discharges the gate. A gate-to-source pull-down defines the off state while the GPIO is high impedance at boot.",
    formula: String.raw`V_{GS}=V_G-V_S,\qquad V_{DS(on)}=I_D R_{DS(on)},\qquad P_{cond}=I_D^2R_{DS(on)}`,
    worked: "At 0.5 A, a fully enhanced switch with RDS(on) = 0.2 Ω drops 0.1 V and dissipates 0.05 W continuously. ID is drain current and RDS(on) is the on-resistance at the available gate voltage and junction temperature. This estimate excludes losses during switching.",
    experiment: "mosfet",
    experimentTask: "Trace the steady load current with the switch on. Toggle the gate and identify which GPIO transition supplies gate charge and which removes it. Once the gate voltage settles, the ideal gate current is zero. Predict the conduction loss if load current doubles while on-resistance stays fixed.",
    firmware: "At reset, the GPIO can be high impedance before your initialization code executes. Size a gate pull-down to keep the load off in that interval. For PWM, check gate charge, drive current, switching time and whether the gate needs a dedicated driver.",
    mistake: "A design selects a MOSFET for a 1.8 V GPIO using only its threshold voltage. Threshold marks a small test current. Find guaranteed on-resistance at your available VGS. For a relay, also provide a rated flyback path across the coil, with the diode cathode toward the positive supply.",
    summary: "Read VGS relative to the source. Check guaranteed on-resistance, drain and gate voltage limits, thermal conditions and the turn-off current path. Calculate conduction and switching losses separately.",
    quiz: [
      { question: "A fully on MOSFET carries 2 A with RDS(on) = 0.05 Ω. What is its conduction loss in mW?", answer: "200", explanation: "2² × 0.05 = 0.2 W = 200 mW. Temperature and switching losses require separate checks." },
      { question: "Which specification helps establish the on-state loss for a GPIO-driven MOSFET?", options: ["The smallest threshold voltage", "RDS(on) guaranteed at the available VGS", "The gate’s DC resistance alone"], answer: "RDS(on) guaranteed at the available VGS", explanation: "A low threshold establishes channel onset. The guaranteed on-resistance characterizes useful load conduction at a specified gate drive." },
      { question: "A relay coil connects from +5 V to the drain and the low-side switch opens. Which omission threatens the switch?", options: ["A second GPIO output in parallel", "A series resistor in the ground reference", "A path for coil current after turn-off"], answer: "A path for coil current after turn-off", explanation: "Inductive current persists after the channel opens. A correctly oriented flyback diode or rated clamp limits the drain-voltage excursion." },
    ],
    sources: [
      { title: "Texas Instruments · CSD13381F4 gate-drive specifications", url: "https://www.ti.com/product/CSD13381F4" },
      { title: "Texas Instruments · Practical Considerations in Gate Drive Circuits", url: "https://www.ti.com/lit/an/slua105/slua105.pdf" },
    ],
  },
];

