export const modules = [
  ["Electrical Fundamentals","Voltage, current, resistance, power, ground, AC and DC, Ohm’s and Kirchhoff’s laws"],
  ["Passive Components","Capacitors, inductors, impedance, parasitics and component tolerances"],
  ["Circuit Analysis","Voltage dividers, current limiting, RC and RL circuits, time constants and filters"],
  ["Semiconductor Basics","MOSFETs, diodes, LEDs, Zener diodes, BJTs and switching"],
  ["Power Electronics","LDOs, switching regulators, sequencing, ripple and decoupling"],
  ["Digital Electronics","Logic thresholds, open-drain pins, level shifters and Schmitt triggers"],
  ["Embedded Hardware Interfaces","Reset, boot straps, oscillators, ADCs, DACs and watchdogs"],
  ["Communication Interfaces","UART, SPI, I²C, CAN, USB, PCIe and DDR interfaces"],
  ["Signal Integrity","Reflections, termination, edge rates, impedance and crosstalk"],
  ["PCB and Schematic Design","Return paths, ESD, EMI, connectors and test access"],
  ["Reading Datasheets","Operating conditions, electrical characteristics and timing diagrams"],
  ["Practical Schematic Reviews","Board-level review of power, memory, clocks, reset and interfaces"]
];
export const refs = [
 ["RC time constant","Formulas","τ = R × C","A capacitor charging from zero reaches 63.2% of its final voltage in one time constant. A 10 kΩ resistor and 100 nF capacitor give τ = 1 ms.","lesson/capacitors","rc"],
 ["Voltage divider","Formulas","Vout = Vin × R₂ / (R₁ + R₂)","Use the lower resistor in the numerator. A load at the tap appears in parallel with R₂ and reduces the output voltage.","lesson/voltage-dividers","divider"],
 ["Ohm’s law","Formulas","V = I × R","For a linear resistor, voltage in volts equals current in amperes times resistance in ohms. A 1 kΩ resistor across 3.3 V carries 3.3 mA.","lesson/ohms-law","ohm"],
 ["Resistor power","Formulas","P = I²R = V²/R","Use the voltage across the resistor. Check dissipation at the worst-case operating point and derate for ambient temperature.","lesson/resistance","ohm"],
 ["A capacitor between VDD and GND","Schematic patterns","Local decoupling","This capacitor supplies fast transient current while the upstream supply responds. Check the recommended capacitance, effective capacitance under bias, and layout loop area.","lesson/capacitors","rc"],
 ["A pull-up on SDA","Schematic patterns","Open-drain bus","Each device releases the line for a high and sinks current for a low. The pull-up and total bus capacitance set the rising edge.","academy/i2c","pullup"],
 ["A resistor in series with a GPIO","Schematic patterns","Series resistance","It may limit current or damp a fast edge. Identify the downstream load first. For source termination, inspect driver impedance and resistor placement.","lesson/resistance","ohm"],
 ["A diode across a relay coil","Schematic patterns","Inductive flyback","In a low-side switch, the diode’s cathode goes to the positive supply. When the switch opens, coil current recirculates through the diode.","lesson/mosfets","diode"],
 ["A divider feeding an ADC","Schematic patterns","Analog input scaling","Check the largest input against the ADC range and pin limits. The divider’s source impedance must let the sample capacitor settle in the acquisition window.","lesson/voltage-dividers","divider"],
 ["SI prefixes and unit conversions","Terminology","p · n · µ · m · k · M","Pico, nano, micro and milli mean 10⁻¹², 10⁻⁹, 10⁻⁶ and 10⁻³. Kilo and mega mean 10³ and 10⁶. Thus 100 nF = 0.1 µF and 4.7 kΩ = 4700 Ω.","lesson/capacitors","rc"],
 ["Logic voltage levels","Terminology","VIH, VIL, VOH, VOL","Compare the transmitter’s guaranteed VOH(min) and VOL(max) against the receiver’s VIH(min) and VIL(max) at the actual supplies, load and temperature.","academy/i2c","pullup"],
 ["Absolute maximum ratings","Terminology","Stress limits","Design for the recommended operating conditions. Absolute maximum ratings describe stress boundaries and do not guarantee correct operation.","lesson/voltage","ohm"],
 ["MOSFET gate threshold","Terminology","VGS(th)","Threshold is measured at a small specified current. Select a MOSFET with guaranteed on-resistance at the available gate-to-source voltage.","lesson/mosfets","mosfet"],
 ["Schematic symbols","Symbols","R · C · D · Q","R identifies a resistor, C a capacitor, D a diode and Q a transistor. Read both the reference designator and the symbol, then confirm the part number and pinout.","academy/reset","symbols"],
 ["I²C rise time","Formulas","tr ≈ 0.8473 × Rp × Cbus","This first-order estimate measures a rising edge from 30% to 70% of its final voltage. Check timing for the bus mode and sink current for the pull-up.","academy/i2c","pullup"]
];
export const checks:Record<string,[string,string][]> = {
 "Power":[["Can every rail support startup and peak load?","Check the regulator current limit, dropout, sequencing and power-good timing."],["Are local bypass capacitors specified?","Compare effective capacitance and ESR with the silicon vendor’s requirements."]],
 "Reset and Boot":[["Will reset stay asserted until the rails are valid?","Compare the reset threshold and pulse width with worst-case supply ramp and RC timing."],["Are bootstrap pins defined during sampling?","Check strap pulls against attached peripherals before firmware configures the pins."]],
 "Clocking":[["Does the oscillator meet the crystal specifications?","Check load capacitance, ESR, drive level and startup margin."],["Does the clock source match the configured mode?","An external clock and a crystal typically require different pin connections and firmware settings."]],
 "GPIO":[["Are inputs defined when drivers release them?","Check the pin state during reset and sleep, including leakage and internal pulls."],["Can the GPIO drive the load?","Verify pin and package current, output levels and MOSFET gate drive under actual conditions."]],
 "Digital Interfaces":[["Are voltage domains compatible in every power state?","Check thresholds, absolute pin limits and possible back-powering through protection structures."],["Are open-drain pull-ups within bounds?","The weakest sink limits the smallest resistor. Bus capacitance limits the largest."]],
 "Analog":[["Can the ADC settle during acquisition?","Check source resistance, sampling capacitance and acquisition time together."],["Is the full input range safe?","Calculate worst-case divider gain and sensor output, including tolerances."]],
 "Protection":[["Are exposed connectors protected against ESD?","Check clamp voltage, capacitance and the path from the connector to the protection device."],["Is inductive turn-off current controlled?","Trace the recirculation path and check switch stress and diode polarity."]],
 "High-Speed Signals":[["Is termination correct for the interface?","Confirm the required type, value and end of the link against the interface design guide."],["Are routing constraints documented?","Carry pair impedance, length matching, reference planes and permitted via transitions into layout review."]]
};

