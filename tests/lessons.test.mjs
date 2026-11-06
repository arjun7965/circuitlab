import assert from "node:assert/strict";
import test from "node:test";
import { lessons } from "../content/lessons.ts";

// Read the quantities learners actually see. Editing an input, result, or unit in
// the lesson should exercise the calculation again without updating this file.
const numberWithUnit = /([+-]?\d+(?:\.\d+)?)\s+(kΩ|Ω|mV|V|mA|A|mW|W|nF|ms|µC|C)(?=$|[\s.,;)])/gu;

function quantities(text, units) {
  const matches = [...text.matchAll(numberWithUnit)];
  assert.deepEqual(matches.map(match => match[2]), units, "Check units and quantity order");
  return matches.map(match => Number(match[1]));
}

function near(displayed, calculated, rounding = 1e-9) {
  assert.ok(Math.abs(displayed - calculated) <= rounding,
    `Displayed ${displayed}, expected ${calculated} within ${rounding}`);
}

function numericQuiz(lesson, units) {
  const numeric = lesson.quiz.filter(question => !question.options);
  assert.equal(numeric.length, 1);
  assert.match(numeric[0].answer, /^[+-]?\d+(?:\.\d+)?$/);
  return { inputs: quantities(numeric[0].question, units), answer: Number(numeric[0].answer) };
}

function lesson(slug) {
  const result = lessons.find(item => item.slug === slug);
  assert.ok(result, `Missing lesson ${slug}`);
  return result;
}

test("Voltage uses a signed difference between nodes", () => {
  const data = lesson("voltage");
  const [a, b, reading] = quantities(data.worked, ["V", "V", "V"]);
  near(reading, a - b);
  const { inputs, answer } = numericQuiz(data, ["V", "V"]);
  near(answer, inputs[0] - inputs[1]);
});

test("Current integrates charge over time and sums independent rail loads", () => {
  const data = lesson("current");
  const [radioMA, pulseMs, chargeC, chargeMicroC, mcuMA, totalMA] =
    quantities(data.worked, ["mA", "ms", "C", "µC", "mA", "mA"]);
  near(chargeC, radioMA * 1e-3 * pulseMs * 1e-3);
  near(chargeMicroC, chargeC * 1e6);
  near(totalMA, radioMA + mcuMA);
  const { inputs, answer } = numericQuiz(data, ["mA", "mA"]);
  near(answer, inputs[0] + inputs[1]);
});

test("Resistance predicts current and power for both example loads", () => {
  const data = lesson("resistance");
  const [resistanceK, volts, currentMA, powerMW, replacementOhms, replacementMW] =
    quantities(data.worked, ["kΩ", "V", "mA", "mW", "Ω", "mW"]);
  near(currentMA, volts / (resistanceK * 1e3) * 1e3);
  near(powerMW, volts * currentMA);
  near(replacementMW, volts ** 2 / replacementOhms * 1e3);
  const { inputs: [kOhms, drop], answer } = numericQuiz(data, ["kΩ", "V"]);
  near(answer, drop / (kOhms * 1e3) * 1e3);
});

test("Ohm’s law uses the residual LED voltage and the shunt drop", () => {
  const data = lesson("ohms-law");
  const [supply, ledDrop, resistorDrop, ohms, currentMA] =
    quantities(data.worked, ["V", "V", "V", "Ω", "mA"]);
  near(resistorDrop, supply - ledDrop);
  near(currentMA, resistorDrop / ohms * 1e3, 0.005);
  const { inputs: [shuntOhms, dropMV], answer } = numericQuiz(data, ["Ω", "mV"]);
  near(answer, dropMV / shuntOhms);
});

test("Capacitors charge exponentially with the stated time constant", () => {
  const data = lesson("capacitors");
  const [resistanceK, capacitanceNF, tauMs, supply, voltageAtTau] =
    quantities(data.worked, ["kΩ", "nF", "ms", "V", "V"]);
  near(tauMs, resistanceK * 1e3 * capacitanceNF * 1e-9 * 1e3);
  near(voltageAtTau, supply * (1 - Math.exp(-1)), 0.005);
  const { inputs: [kOhms, nanoFarads], answer } = numericQuiz(data, ["kΩ", "nF"]);
  near(answer, kOhms * nanoFarads * 1e-3);
});

test("Voltage dividers include source resistance and parallel loading", () => {
  const data = lesson("voltage-dividers");
  const [vin, topK, bottomK, vout, sourceK, loadK, loadedLegK, loadedVout] =
    quantities(data.worked, ["V", "kΩ", "kΩ", "V", "kΩ", "kΩ", "kΩ", "V"]);
  near(vout, vin * bottomK / (topK + bottomK), 0.005);
  near(sourceK, 1 / (1 / topK + 1 / bottomK), 0.005);
  near(loadedLegK, 1 / (1 / loadK + 1 / bottomK));
  near(loadedVout, vin * loadedLegK / (topK + loadedLegK));
  const { inputs: [supply, top, bottom], answer } = numericQuiz(data, ["V", "kΩ", "kΩ"]);
  near(answer, supply * bottom / (top + bottom));
});

test("MOSFET on-state examples distinguish voltage drop and power loss", () => {
  const data = lesson("mosfets");
  const [amps, ohms, volts, watts] = quantities(data.worked, ["A", "Ω", "V", "W"]);
  near(volts, amps * ohms);
  near(watts, amps ** 2 * ohms);
  const { inputs: [current, resistance], answer } = numericQuiz(data, ["A", "Ω"]);
  near(answer, current ** 2 * resistance * 1e3);
});
