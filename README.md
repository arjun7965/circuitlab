# CircuitLab

**[Open the CircuitLab learning dashboard](https://circuitlab-firmware-workbench.arjun7965.chatgpt.site)** · The hosted site is private and requires owner access. You can also run your own copy locally.

CircuitLab helps firmware engineers read and review PCB schematics. Start with a circuit, change a component value, and connect the result to a practical question such as whether an ADC input will settle or an I²C line will rise fast enough.

## Try a loaded voltage divider

Open **Circuit Playground → Voltage divider**. Set the supply to **5 V**, the upper resistor to **20 kΩ**, and the lower resistor to **10 kΩ**. The unloaded tap reads about **1.67 V**. Switch to **Loaded** and set the load to **10 kΩ**. It sits in parallel with the lower resistor, making the effective lower leg **5 kΩ**. The new tap voltage is **5 V × 5 / (20 + 5) = 1 V**.

## What you can explore

| Area | What’s included |
| --- | --- |
| Learning path | Seven complete lessons on voltage, current, resistance, Ohm’s law, capacitors, voltage dividers, and MOSFETs. Each includes a worked example, an experiment, and a knowledge check. Future lessons are marked as planned. |
| Circuit Playground | Eleven adjustable experiments covering resistor networks, RC charging and discharging, LEDs, MOSFETs, open-drain signaling, I²C rise time, resistor sizing, regulator heating, and decoupling. |
| Schematic Reading Academy | Click through an MCU reset circuit and an I²C sensor interface to inspect components, follow signal states, and identify datasheet parameters to check. |
| Quick Reference and Review Checklist | Look up formulas and schematic patterns, then check power, reset, clock, GPIO, analog, protection, and interface decisions during a board review. |

Lesson progress, quiz history, bookmarks, and checklist selections are saved in the current browser. Clearing its site data removes those records.

## Run locally

Use Node.js 22.20 and npm. From a terminal with access to this repository, run

```sh
git clone https://github.com/arjun7965/circuitlab.git
cd circuitlab
npm ci
npm run dev
```

Open [the local dashboard](http://localhost:3000). The app runs entirely in the browser after its assets load.

## Test and build

```sh
npm test
npm run build
```

The tests check calculator results against independently worked values, exercise operating modes and invalid inputs, and verify numerical examples and quiz answers in the lessons. The production build exports a static site to `out/`, which can be served by a static web server.

## Engineering models

Each experiment documents its equations, assumptions, and sources under **Model assumptions & source**. For example, the I²C calculator estimates the 30–70% rise time of a passive pull-up and lumped bus capacitance. Its result depends on the capacitance you supply. For a board review, compare the result with the selected bus mode’s timing limits and each device’s guaranteed sink current.

The experiments use analytical models. Validation covers their stated operating conditions. Device-specific switching behavior, PCB parasitics, and board-level performance require the relevant datasheets, simulation models, or measurements.

## Source guide

- [Lesson content](content/lessons.ts) contains explanations, worked examples, quizzes, and references.
- [Reference library](content/library.ts) contains the curriculum outline, quick-reference entries, and review checklist.
- [Circuit equations](components/math.ts) and [experiment definitions](components/experimentModels.ts) implement the calculations, input bounds, and model assumptions.
- [Experiment diagrams](components/ExperimentDiagram.tsx) and [schematic walkthroughs](components/Academy.tsx) render the interactive SVG circuits.
- [Calculator tests](components/experiments.test.cjs) and [lesson tests](tests/lessons.test.mjs) contain the numerical regression checks.

Built with Next.js, TypeScript, React, KaTeX, and Recharts.
