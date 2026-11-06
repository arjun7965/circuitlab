// Run from the site checkout with node --test components/experiments.test.cjs.
// Compile the small model modules using the project's existing TypeScript dependency.
const {test} = require("node:test");
const assert = require("node:assert/strict");
const {readFileSync} = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => {
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  });
  module._compile(source.outputText, filename);
};
const {models, evaluate} = require("./experimentModels.ts");
const {rcVoltage, riseTime} = require("./math.ts");
const defaults = model => Object.fromEntries(model.fields.map(f => [f.key, f.initial]));
function evaluateFixture(id, inputs = {}, alternate = false) {
  const model = models.find(m => m.id === id);
  return evaluate(model, {...defaults(model), ...inputs}, alternate);
}
function measured(id, inputs = {}, alternate = false) {
  const result = evaluateFixture(id, inputs, alternate);
  assert.equal(result.issue, undefined);
  return Object.fromEntries(result.metrics);
}
test("divider: 12 V across 2 kΩ + 1 kΩ gives 4 V; equal ratios preserve voltage but change current", () => {
  assert.deepEqual(measured("divider", {vs:12,r1:2,r2:1}), {"Output voltage":"4 V","Supply current":"4 mA","Source resistance":"0.6667 kΩ"});
  assert.equal(measured("divider",{vs:12,r1:4,r2:2})["Supply current"],"2 mA");
});
test("divider: 6 V with three 1 kΩ resistors gives 2 V loaded and an equal current split", () => {
  assert.deepEqual(measured("divider",{vs:6,r1:1,r2:1,rl:1},true),{"Output voltage":"2 V","Supply current":"4 mA","Source resistance":"0.5 kΩ","Load current":"2 mA"});
  assert.deepEqual(measured("divider",{vs:6,r1:1,r2:1,rl:1}),{"Output voltage":"3 V","Supply current":"3 mA","Source resistance":"0.5 kΩ"});
});
test("divider: independent Thevenin method agrees at an unequal load and the unloaded mode ignores hidden input", () => {
  // Open circuit is 4 V with a 1 kΩ source; a 3 kΩ load therefore gives 3 V.
  const v={vs:8,r1:2,r2:2,rl:3};
  assert.deepEqual(measured("divider",v,true),{"Output voltage":"3 V","Supply current":"2.5 mA","Source resistance":"1 kΩ","Load current":"1 mA"});
  assert.equal(measured("divider",{...v,rl:NaN})["Output voltage"],"4 V");
  assert.ok(evaluateFixture("divider",{...v,rl:0},true).issue);
});
test("RC: charge and discharge limits, one-time-constant values and scaled millisecond probe", () => {
  assert.deepEqual(measured("rc",{vs:5,r:10,c:2,probe:1}), {"Probe voltage":"3.161 V","Time constant":"20 ms","Probe time":"20 ms"});
  assert.equal(measured("rc",{vs:5,r:10,c:2,probe:1},true)["Probe voltage"], "1.839 V");
  assert.equal(measured("rc",{vs:5,probe:0},true)["Probe voltage"], "5 V");
  assert.equal(measured("rc",{vs:5,probe:0})["Probe voltage"], "0 V");
  assert.ok(Math.abs(rcVoltage(0,5,0.1,0.02)-4.9663103)<1e-7);
});
test("Ohm's law: 5 V across 500 Ω is 10 mA and 50 mW", () => {
  assert.deepEqual(measured("ohm",{vs:5,r:0.5}), {"Load current":"10 mA","Power":"50 mW"});
});
test("series/parallel: two unequal resistors and both physical connections", () => {
  assert.equal(measured("resistors",{r1:6,r2:3})["Equivalent resistance"],"9 kΩ");
  assert.equal(measured("resistors",{r1:6,r2:3},true)["Equivalent resistance"],"2 kΩ");
});
test("LED: 5 V supply, 2 V diode, 10 mA target and insufficient headroom", () => {
  assert.deepEqual(measured("led",{vs:5,vf:2,ma:10}), {"Series resistance":"300 Ω","Resistor power":"30 mW"});
  for (const vs of [1,2]) assert.ok(evaluateFixture("led",{vs,vf:2}).issue);
});
test("MOSFET: fully enhanced switch dissipates I²R; open switch carries no current", () => {
  const on = measured("mosfet",{vs:5,load:49.5,ron:500});
  assert.deepEqual(on,{"Load current":"100 mA","Drain voltage":"0.05 V","MOSFET loss":"5 mW"});
  assert.deepEqual(measured("mosfet",{vs:5,load:49.5,ron:500},true), {"Load current":"0 mA","Drain voltage":"5 V","MOSFET loss":"0 mW"});
});
test("open-drain: released and asserted states of a 3.3 V line with 3.3 kΩ pull-up", () => {
  assert.deepEqual(measured("drain",{r:3.3,vs:3.3}),{"Bus voltage":"3.3 V","Sink current":"0 mA"});
  assert.deepEqual(measured("drain",{r:3.3,vs:3.3},true),{"Bus voltage":"0 V","Sink current":"1 mA"});
});
test("I²C: TI SLVA689 200 pF Fast-mode worked example and both resistor bounds", () => {
  assert.ok(Math.abs(riseTime(1000,200e-12)*1e9-169.46) < 0.01);
  assert.deepEqual(measured("i2c",{r:1,cb:200}),{"Rise time":"169.5 ns","Maximum pull-up":"1.77 kΩ","Example limits":"Within limits"});
  assert.equal(measured("i2c",{r:2,cb:200})["Example limits"],"Edge too slow");
  assert.equal(measured("i2c",{r:0.9,cb:200})["Example limits"],"Sink current high");
});
test("resistor sizing: 10 V across 100 Ω gives 1 W and requires 2 W at 50% utilization", () => {
  assert.deepEqual(measured("power",{vs:10,ohms:100,usage:50}),{"Dissipation":"1000 mW","Target rating ≥":"2 W","Current":"100 mA"});
});
test("LDO: 5 V to 3.3 V at 200 mA produces a 17 °C rise at 50 °C/W; dropout boundary", () => {
  assert.deepEqual(measured("ldo",{vs:5,out:3.3,ma:200,amb:25,theta:50}),{"Power loss":"0.34 W","Junction estimate":"42 °C","Efficiency":"66 %"});
  assert.ok(evaluateFixture("ldo",{vs:3.4,out:3.3}).issue);
  assert.equal(evaluateFixture("ldo",{vs:3.5,out:3.3}).issue,undefined);
});
test("decoupling: 100 mA for 2 µs on 10 µF drops 20 mV, plus 5 mV for ESR; rail collapse", () => {
  assert.deepEqual(measured("decoupling",{ma:100,us:2,c:10,esr:50}),{"Rail droop":"25 mV","Final voltage":"3.275 V","ESR step":"5 mV"});
  assert.ok(evaluateFixture("decoupling",{ma:200,us:10,c:0.1}).issue);
});
for (const model of models) {
  test(model.id+" displays a valid equation and links its reference", () => {
    for (const equation of [model.equation,model.alternateEquation].filter(Boolean)) {
      const rendered = require("katex").renderToString(equation, {throwOnError:true});
      assert.match(rendered, /<math/);
    }
    assert.equal(new URL(model.source[1]).protocol, "https:");
  });
  test(model.id+" rejects empty, nonfinite and out-of-range inputs without an output", () => {
    for (const field of model.fields) {
      for (const bad of [undefined, NaN, Infinity, -Infinity, field.min-field.step, field.max+field.step]) {
        const result=evaluate(model, {...defaults(model), [field.key]:bad},Boolean(field.alternateOnly));
        assert.ok(result.issue);
        assert.deepEqual(result.metrics, []);
      }
    }
  });
  test(model.id+" handles endpoints of all parameter ranges", () => {
    for (const field of model.fields) {
      for (const limit of [field.min,field.max]) {
        const result=evaluate(model,{...defaults(model),[field.key]:limit},Boolean(field.alternateOnly));
        assert.ok(result.issue || result.metrics.length>0);
        assert.doesNotMatch(JSON.stringify(result), /NaN|Infinity/);
      }
    }
  });
}
