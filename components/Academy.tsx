"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import "./academy.css";

const mint = "#92e9b3";
const pale = "#e2efdf";
const mono = "'IBM Plex Mono', 'Cascadia Code', Consolas, monospace";

function Grid({ id, width, height }: { id: string; width: number; height: number }) {
  return <>
    <defs>
      <pattern id={id + "-minor"} width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M16 0H0V16" fill="none" stroke="#7db8a4" opacity=".15" strokeWidth=".65" />
      </pattern>
      <pattern id={id + "-major"} width="80" height="80" patternUnits="userSpaceOnUse">
        <rect width="80" height="80" fill={`url(#${id}-minor)`} />
        <path d="M80 0H0V80" fill="none" stroke="#84bfaa" opacity=".17" strokeWidth=".85" />
        <path d="M0 4V0H4 M76 0H80V4 M0 76V80H4 M76 80H80V76" fill="none" stroke="#79ad9c" opacity=".28" />
      </pattern>
    </defs>
    <rect width={width} height={height} fill="#103c36" />
    <rect width={width} height={height} fill={`url(#${id}-major)`} />
  </>;
}

function Resistor({ x, y, length = 40 }: { x: number; y: number; length?: number }) {
  return <path transform={`translate(${x} ${y}) scale(1 ${length / 40})`} d="M0 0v3l-6 3 12 5-12 5 12 5-12 5 12 5-6 3v6" />;
}

function Ground({ x, y }: { x: number; y: number }) {
  return <path transform={`translate(${x} ${y})`} d="M0 0v5m-11 0h22m-18 5h14m-10 5h6" />;
}

/** An unloaded divider, with an explicit supply and shared return. */
export function Blueprint({ kind = "divider" }: { kind?: string }) {
  const id = useId().replace(/:/g, "");
  return <svg className="cl-blueprint" viewBox="0 0 440 230" role="img" aria-label="Unloaded voltage divider. A five volt source feeds two ten kilohm resistors in series. Their midpoint is 2.50 volts." data-kind={kind}>
    <Grid id={id} width={440} height={230} />
    <g fill="none" stroke="#5c9a88" opacity=".65" strokeWidth="1">
      <path d="M12 23V12h11M417 12h11v11M12 207v11h11M417 218h11v-11" />
    </g>
    <g fontFamily={mono} fontSize="8" fill="#9fc6b5" letterSpacing="1.2">
      <text x="24" y="28">FIG. 01</text>
      <text x="416" y="28" textAnchor="end">DC / DIVIDER</text>
    </g>
    <g stroke={mint} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" fill="none">
      <path d="M84 94V53h138v12M222 105v23m0 34v18H84v-48" />
      <circle cx="84" cy="113" r="19" />
      <path d="M80 106h8m-4-4v8m-4 12h8" strokeWidth="1.45" />
      <Resistor x={222} y={65} />
      <Resistor x={222} y={125} length={37} />
      <path d="M222 115h105" />
      <circle cx="331" cy="115" r="4" fill="#103c36" />
      <circle cx="222" cy="115" r="3.8" fill={mint} />
      <circle cx="222" cy="180" r="2.8" fill={mint} />
      <Ground x={222} y={180} />
    </g>
    <g fontFamily={mono} fill={pale} fontSize="12">
      <text x="54" y="109" textAnchor="end">V<tspan dy="3" fontSize="8">IN</tspan></text>
      <text x="54" y="127" textAnchor="end" fill={mint} fontSize="11">5 V</text>
      <text x="242" y="83">R1</text><text x="242" y="99" fill="#a5c9b9" fontSize="10">10 kΩ</text>
      <text x="242" y="142">R2</text><text x="242" y="158" fill="#a5c9b9" fontSize="10">10 kΩ</text>
      <text x="347" y="111">V<tspan dy="3" fontSize="8">OUT</tspan></text>
      <text x="347" y="132" fill={mint}>2.50 V</text>
      <text x="222" y="211" fontSize="9" fill="#a5c9b9" textAnchor="middle">GND</text>
    </g>
  </svg>;
}

type Part = { id: string; symbol: string; name: string; purpose: string; selection: string; failure: string; check: string };
type SdaSink = "MCU" | "sensor" | "released";
type Walkthrough = { title: string; short: string; intro: string; parts: Part[]; stages: [string, string, SdaSink?][]; source: [string, string] };
const circuits: Record<"reset" | "i2c", Walkthrough> = {
  reset: {
    title: "MCU reset circuit", short: "MCU reset",
    intro: "Follow the reset signal during power-up, button press, and release. Select a symbol to inspect its role.",
    parts: [
      { id: "r1", symbol: "R1", name: "Reset pull-up", purpose: "The resistor charges C1 from the 3.3 V rail and gives RESET_N a defined high level when the button is open.", selection: "10 kΩ here draws 330 µA with the button held. If the MCU includes a pull-up, use the parallel combination when calculating timing.", failure: "Without any pull-up the pin can float. A weak pull-up makes leakage and noise more significant. A strong one increases switch current.", check: "Check the internal pull-up range, input leakage, allowed external drive and reset thresholds." },
      { id: "c1", symbol: "C1", name: "Reset capacitor", purpose: "The capacitor stores charge on RESET_N. With R1 it slows the rising edge after switch release.", selection: "100 nF with 10 kΩ gives a 1 ms time constant. The time to a particular threshold depends on its fraction of the supply.", failure: "Too much capacitance can delay restart or prevent a debug probe from producing a clean reset pulse. Too little reduces noise filtering.", check: "Look up the recommended reset network, allowed capacitance, pulse width and input rise-time limits." },
      { id: "sw1", symbol: "SW1", name: "Normally open switch", purpose: "Pressing the switch gives the reset line a low-resistance path to ground and discharges C1.", selection: "Use a momentary contact rated for the environment. Long leads may need extra filtering and ESD protection.", failure: "A stuck contact holds the MCU in reset. Contact bounce can produce several transitions on release.", check: "Check contact bounce, discharge current, and the MCU’s minimum low pulse width." },
      { id: "u1", symbol: "U1", name: "MCU reset input", purpose: "A valid low level on the active-low reset pin holds or returns the processor to its documented reset state.", selection: "This generic input illustrates external reset. Some MCUs have internal pull-ups, brownout detectors and bidirectional reset pins.", failure: "The first instruction may execute late or the board may repeatedly reboot if reset or rail timing violates the device specification.", check: "Read the reset timing diagram, VIL/VIH limits, power-on reset behavior and reset-source registers." }
    ],
    stages: [
      ["Power-up", "With C1 initially discharged and an ideal supply step, RESET_N starts near 0 V. R1 charges C1 toward 3.3 V. A real supply ramp and the MCU’s internal power-on reset determine startup."],
      ["Button pressed", "SW1 closes and rapidly discharges C1. RESET_N stays near 0 V while 3.3 V / 10 kΩ = 330 µA flows through R1 and the switch."],
      ["Released", "With SW1 open, VRESET = 3.3 × (1 − e^(−t/1 ms)) V. An illustrative threshold of 0.7 × VDD is reached after 1.20 ms. Use the actual MCU threshold and its internal reset delay."]
    ],
    source: ["STMicroelectronics · AN4488, reset circuitry", "https://www.st.com/resource/en/application_note/an4488-getting-started-with-stm32f4xxxx-mcu-hardware-development-stmicroelectronics.pdf"]
  },
  i2c: {
    title: "I²C sensor interface", short: "I²C interface",
    intro: "Trace the clock and data lines between a controller and a sensor. Select a symbol to inspect its electrical constraints.",
    parts: [
      { id: "r1", symbol: "R1", name: "SDA pull-up", purpose: "Each device can pull the data line low. When every device releases SDA, R1 charges the line capacitance toward 3.3 V.", selection: "For 4.7 kΩ and 100 pF, the 30–70% rise takes about 398 ns. That meets the 1 µs Standard-mode maximum and exceeds the 300 ns Fast-mode maximum.", failure: "An excessively large resistor produces slow rising edges. Too small a resistor can exceed a device’s sink-current limit or create an edge faster than the Fast-mode minimum.", check: "Fast-mode specifies a 20–300 ns rise. For a passive pull-up, choose at least the larger of (VDD − VOL(max)) / IOL and 20 ns / (0.8473 × Cbus). The timing upper bound is 300 ns / (0.8473 × Cbus). Include parallel pull-ups on modules and use the weakest device’s guaranteed sink rating." },
      { id: "r2", symbol: "R2", name: "SCL pull-up", purpose: "R2 raises the released clock line. A target that supports clock stretching can hold SCL low until it is ready.", selection: "Calculate the clock line’s own capacitance and rise time. Use the weakest guaranteed sink current among the devices that can pull it low.", failure: "A slow rising clock reduces available high time at the receiving pin. Extra cable or probe capacitance can expose a marginal board.", check: "Check the bus-mode limits, SCL high time, rise time, VOL and supported clock stretching behavior." },
      { id: "u1", symbol: "U1", name: "MCU controller", purpose: "The MCU supplies the clocks. After transmitting an address or write-data byte it releases SDA for the target’s response. After receiving read data, it pulls SDA low to request another byte or releases SDA to end the read.", selection: "Configure the chosen pins for their I²C alternate function and open-drain behavior. Select timing values for the measured rise time.", failure: "A push-pull high output can fight another device pulling low. A wrong pin mux can leave both bus lines idle.", check: "Check the I/O supply domain, guaranteed high and low thresholds, current limits, pin mux and peripheral timing registers." },
      { id: "u2", symbol: "U2", name: "Sensor target", purpose: "The addressed sensor pulls SDA low to acknowledge its address and accepted write data. When transmitting read data, it releases SDA for the MCU’s response on the ninth clock.", selection: "This direct connection assumes both devices accept the same 3.3 V bus high. Check all power states when rails can sequence independently.", failure: "An incompatible pull-up voltage can damage a pin or back-power a sleeping device. An address conflict gives ambiguous acknowledgments.", check: "Check absolute maximum ratings, operating thresholds, address straps, supported bus speed and power-off pin behavior." }
    ],
    stages: [
      ["Bus idle", "Both devices release SDA and SCL. Each pull-up brings its line to 3.3 V. At steady state only leakage current flows.", "released"],
      ["START", "With SCL high, the MCU pulls SDA low. This falling edge signals START. R1 now supplies current through the MCU’s open-drain output.", "MCU"],
      ["Address/write ACK", "After sending the seven-bit address and direction bit, the MCU releases SDA. The addressed sensor pulls SDA low during the ninth clock to acknowledge either direction. The same handoff follows each accepted write-data byte.", "sensor"],
      ["Address/write NACK", "The MCU releases SDA after sending the byte. If no sensor acknowledges the address or the addressed sensor declines a write byte, SDA stays high on the ninth clock. The MCU may issue STOP or a repeated START.", "released"],
      ["Read-data ACK", "After transmitting eight data bits, the sensor releases SDA. The MCU now receives data. To request another byte, it pulls SDA low for the ninth clock, which it also generates.", "MCU"],
      ["Final read NACK", "After the final read byte, the sensor releases SDA and the MCU leaves it released. SDA is high on the ninth clock. This NACK signals a normal end of reading before the MCU issues STOP or a repeated START.", "released"]
    ],
    source: ["Texas Instruments · I²C bus pull-up calculation", "https://www.ti.com/lit/an/slva689/slva689.pdf"]
  }
};

type PickProps = { selected: string; choose: (value: string) => void };
function Target({ id, name, selected, choose, bounds, children }: PickProps & { id: string; name: string; bounds: [number, number, number, number]; children: ReactNode }) {
  const [x, y, width, height] = bounds;
  return <g role="button" aria-label={name} aria-pressed={selected === id} tabIndex={0}
    className={"cl-svg-target" + (selected === id ? " is-active" : "")}
    onClick={() => choose(id)} onKeyDown={event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(id); }
    }}>
    <title>{name}</title>
    <rect className="cl-svg-hit" x={x} y={y} width={width} height={height} rx="5" />
    {children}
  </g>;
}

function ResetDrawing(props: PickProps & { stage: number }) {
  return <>
    <text x="232" y="32" textAnchor="middle">+3.3 V</text>
    <path d="M222 42h20m-10 0v16M232 101v41H100v22m132-22v30m0-30h177M100 216v14h132m0-32v32" />
    <Ground x={232} y={230} />
    <circle cx="232" cy="142" r="4" className="cl-dot" />
    <circle cx="232" cy="230" r="3" className="cl-dot" />
    <text x="320" y="131" className="cl-net">RESET_N</text>
    <Target {...props} id="r1" name="R1 reset pull-up" bounds={[207, 53, 108, 63]}>
      <Resistor x={232} y={58} length={43} /><text x="255" y="76">R1</text><text x="255" y="97" className="cl-value">10 kΩ</text>
    </Target>
    <Target {...props} id="c1" name="C1 reset capacitor" bounds={[207, 164, 115, 51]}>
      <path d="M232 172v8m-17 0h34m-34 8h34m-17 0v10" />
      <text x="261" y="181">C1</text><text x="261" y="201" className="cl-value">100 nF</text>
    </Target>
    <Target {...props} id="sw1" name="SW1 reset switch" bounds={[44, 157, 87, 70]}>
      <circle cx="100" cy="168" r="4" /><circle cx="100" cy="212" r="4" />
      <path d={props.stage === 1 ? "M100 172v36" : "M100 208l-16-34"} /><text x="78" y="186" textAnchor="end">SW1</text>
    </Target>
    <Target {...props} id="u1" name="U1 MCU reset input" bounds={[398, 98, 130, 104]}>
      <rect className="cl-chip" x="409" y="107" width="108" height="81" rx="4" /><text x="463" y="131" textAnchor="middle">U1 · MCU</text><path d="M409 143h9" /><text x="463" y="159" textAnchor="middle" className="cl-value">RESET_N</text>
    </Target>
  </>;
}

function BusDrawing(props: PickProps & { sink: SdaSink }) {
  return <>
    <text x="289" y="28" textAnchor="middle">+3.3 V</text>
    <path d="M235 57V40h106v17M235 99v52M341 99v91M150 151h184m14 0h89m-287 39h287" />
    <path d="M334 151a7 7 0 0 1 14 0" fill="none" style={{stroke:"#103c36",strokeWidth:7}} /><path d="M334 151a7 7 0 0 1 14 0" fill="none" />
    <circle cx="235" cy="151" r="4" className="cl-dot" />
    <circle cx="341" cy="190" r="4" className="cl-dot" />
    <text x="193" y="141" className="cl-net">SDA</text><text x="193" y="180" className="cl-net">SCL</text>
    <Target {...props} id="r1" name="R1 SDA pull-up" bounds={[202, 50, 103, 57]}>
      <Resistor x={235} y={57} length={42} /><text x="251" y="74">R1</text><text x="251" y="93" className="cl-value">4.7 kΩ</text>
    </Target>
    <Target {...props} id="r2" name="R2 SCL pull-up" bounds={[314, 50, 94, 57]}>
      <Resistor x={341} y={57} length={42} /><text x="357" y="74">R2</text><text x="357" y="93" className="cl-value">4.7 kΩ</text>
    </Target>
    <Target {...props} id="u1" name="U1 I2C controller" bounds={[30, 115, 130, 108]}>
      <rect className="cl-chip" x="38" y="122" width="112" height="93" rx="4" />
      <text x="94" y="149" textAnchor="middle">U1 · MCU</text><text x="94" y="170" textAnchor="middle" className="cl-value">Controller</text>
      <text x="94" y="197" textAnchor="middle" className="cl-net">{props.sink === "MCU" ? "SDA sink" : "Released"}</text>
    </Target>
    <Target {...props} id="u2" name="U2 sensor target" bounds={[428, 115, 139, 108]}>
      <rect className="cl-chip" x="437" y="122" width="121" height="93" rx="4" />
      <text x="497" y="149" textAnchor="middle">U2 · SENSOR</text><text x="497" y="170" textAnchor="middle" className="cl-value">Target</text>
      <text x="497" y="197" textAnchor="middle" className="cl-net">{props.sink === "sensor" ? "SDA sink" : "Released"}</text>
    </Target>
    <text x="298" y="240" className="cl-net" textAnchor="middle">SDA {props.sink === "released" ? "HIGH" : "LOW"} · SCL HIGH</text>
  </>;
}

export function Academy({ initial, onBookmark, saved = [] }: { initial?: string; onBookmark?: (id: string) => void; saved?: string[] }) {
  const [kind, setKind] = useState<"reset" | "i2c">(initial === "i2c" ? "i2c" : "reset");
  const [selected, choose] = useState("r1");
  const [stage, setStage] = useState(0);
  const id = useId().replace(/:/g, "");
  useEffect(() => { setKind(initial === "i2c" ? "i2c" : "reset"); choose("r1"); setStage(0); }, [initial]);
  const circuit = circuits[kind];
  const part = circuit.parts.find(item => item.id === selected) || circuit.parts[0];
  return <section className="cl-academy" aria-label="Schematic walkthroughs">
    <div className="cl-switcher" aria-label="Choose a walkthrough">
      {(["reset", "i2c"] as const).map(key => <button key={key} aria-pressed={kind === key} onClick={() => { setKind(key); choose("r1"); setStage(0); window.location.hash = "academy/" + key; }}>{circuits[key].short}</button>)}
    </div>
    <div className="cl-ac-card">
      <div className="cl-ac-intro"><div><h2>{circuit.title}</h2><p>{circuit.intro}</p></div>
        {onBookmark && <button className="cl-save" aria-pressed={saved.includes(kind)} onClick={() => onBookmark(kind)} aria-label={saved.includes(kind) ? "Remove diagram bookmark" : "Bookmark diagram"}><svg width="19" height="19" viewBox="0 0 24 24" fill={saved.includes(kind) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7"><path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z" /></svg></button>}
      </div>
    {kind === "reset" && <div className="cl-sequence cl-startup">
      <h3>Power-up in four steps</h3>
      <p>Active-low means that a LOW on RESET_N asserts reset and holds the MCU in its reset state. Firmware execution can begin after reset is released and the other startup conditions are met. For the ideal supply step and initially discharged C1 in this example, follow these four steps.</p>
      <ol className="cl-startup-steps">
        <li><strong>Power turns on.</strong> C1 starts with zero voltage across it, so RESET_N initially stays near ground and asserts external reset.</li>
        <li><strong>The capacitor charges.</strong> Current flows through R1 into C1, raising RESET_N toward 3.3 V.</li>
        <li><strong>External reset is released.</strong> The rising voltage crosses the MCU’s reset-release threshold. Use the device’s specified threshold and timing requirements.</li>
        <li><strong>The MCU can begin execution.</strong> Startup code begins once all of the MCU’s reset and startup conditions are satisfied, including any internal reset delays, supply checks, and clock readiness requirements.</li>
      </ol>
      <p>A gradual supply ramp, residual capacitor charge, or an internal pull-up can change the timing. Follow the MCU datasheet to determine when execution actually starts.</p>
    </div>}
      <svg className="cl-walk-svg" viewBox="0 0 590 265" aria-label={circuit.title + ", interactive schematic"} role="group">
        <Grid id={id} width={590} height={265} />
        <g className="cl-schematic-lines">{kind === "reset" ? <ResetDrawing selected={selected} choose={choose} stage={stage} /> : <BusDrawing selected={selected} choose={choose} sink={circuit.stages[stage][2] ?? "released"} />}</g>
      </svg>
      <div className="cl-inspector">
        <p className="cl-scope-note">{kind === "reset" ? "Generic active-low input. Values assume an ideal 3.3 V step, no internal pull-up and negligible pin leakage. The MCU’s supply and ground connections are omitted." : "Both devices share a ground reference and a compatible 3.3 V I/O domain. Only the bus nets are shown. The bridge separates R2’s clock connection from SDA."}</p>
        <div className="cl-component-choices" aria-label="Inspect a component">{circuit.parts.map(item => <button key={item.id} aria-pressed={part.id === item.id} onClick={() => choose(item.id)}>{item.symbol}</button>)}</div>
        <div aria-live="polite"><h3>{part.name}</h3><p>{part.purpose}</p>
          <dl><div><dt>Choosing a value or part</dt><dd>{part.selection}</dd></div><div><dt>If it goes wrong</dt><dd>{part.failure}</dd></div><div><dt>Datasheet checks</dt><dd>{part.check}</dd></div></dl>
        </div>
      </div>
    </div>
    <div className="cl-ac-card cl-sequence"><h3>Follow the signal</h3>
      <div className="cl-stages">{circuit.stages.map(([name], i) => <button key={name} onClick={() => setStage(i)} aria-pressed={stage === i}>{name}</button>)}</div>
      <p aria-live="polite">{circuit.stages[stage][1]}</p>
      <a href={circuit.source[1]} target="_blank" rel="noreferrer">{circuit.source[0]} ↗</a>
      {kind === "i2c" && <a href="https://www.nxp.com/docs/en/user-guide/UM10204.pdf" target="_blank" rel="noreferrer">NXP · I²C bus specification ↗</a>}
    </div>
  </section>;
}

