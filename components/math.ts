// These circuit models use SI units internally. The experiment controls handle unit conversion.
export function current(volts: number, ohms: number) {
  return volts / ohms;
}

export function parallel(a: number, b: number) {
  return a * b / (a + b);
}

export function dividerModel(supply: number, upper: number, lower: number, load?: number) {
  const bottom = load === undefined ? lower : parallel(lower, load);
  const supplyCurrent = supply / (upper + bottom);
  const tap = supplyCurrent * bottom;
  return {tap, supplyCurrent, loadCurrent: load === undefined ? 0 : tap/load, sourceResistance: parallel(upper, lower)};
}

export function rcVoltage(initial: number, final: number, seconds: number, tau: number) {
  return final + (initial - final) * Math.exp(-seconds / tau);
}

export function ledResistor(supply: number, forward: number, amps: number) {
  return supply > forward ? (supply - forward) / amps : null;
}

export function switchModel(supply: number, loadOhms: number, onOhms: number, on: boolean) {
  const amps = on ? supply / (loadOhms + onOhms) : 0;
  return { amps, drain: supply - amps * loadOhms, watts: amps * amps * onOhms };
}

export function riseTime(ohms: number, farads: number) {
  return Math.log(7 / 3) * ohms * farads;
}

export function ldoPower(input: number, output: number, amps: number, ambient: number, thermalResistance: number) {
  const watts = (input - output) * amps;
  return { watts, junction: ambient + watts * thermalResistance };
}

export function capacitorDroop(amps: number, seconds: number, farads: number, esr: number) {
  return amps * esr + amps * seconds / farads;
}
