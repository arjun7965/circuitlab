# CircuitLab TODO

## Curriculum

The intermediate and advanced module outlines have been reviewed. Lesson writing and technical review are tracked separately below.

### Intermediate track · Modules 5–8

- [ ] Write the planned lessons for Power Electronics, Digital Electronics, Embedded Hardware Interfaces, and Communication Interfaces.
- [ ] Review each intermediate lesson before publication. Check the circuit diagrams against the described behavior, independently recompute the worked examples and quiz answers, and verify operating limits against the cited datasheets or specifications.

### Advanced track · Modules 9–12

- [ ] Write the planned lessons for Signal Integrity, PCB and Schematic Design, Reading Datasheets, and Practical Schematic Reviews.
- [ ] Review each advanced lesson before publication. Verify equations, assumptions, diagrams, and quiz answers against primary sources. For schematic-review exercises, check that the supplied schematic and datasheet support the expected finding, and identify conclusions that require layout inspection or measurement.

## Electronics Course

Build a dedicated, self-paced course for experienced firmware engineers returning to electronics. Start with physical fundamentals and build toward decisions a learner can defend in a schematic review. **First milestone: complete Electrical Foundations, including its labs, design exercise, assessment, and technical review, before expanding the other seven course modules.**

### Course sequence

- [ ] Map the existing 12-module learning path and its reviewed lessons to the eight course modules below. Keep the existing track tasks above and reuse their lessons wherever the two sequences overlap.

For each course module, deliver 5–10 lessons in prerequisite order, interactive examples, practice problems, a module assessment, and at least one practical circuit-design exercise.

1. [ ] Electrical Foundations
2. [ ] Circuit Analysis
3. [ ] Capacitors, Inductors, and Frequency Response
4. [ ] Semiconductor Devices and Transistors
5. [ ] Analog Electronics
6. [ ] Power Supply Design
7. [ ] Digital and Embedded Hardware
8. [ ] Practical Schematic Analysis and Design

### Lesson design and learning modes

- [ ] Give every lesson clear objectives and links to relevant prerequisites. Explain the physical behavior with an accurate circuit diagram, derive the equation step by step where appropriate, and work through an example with realistic component values.
- [ ] Include an interactive experiment or visualization, a firmware application, a common mistake and debugging scenario, knowledge checks with detailed explanations, and a concise summary in every lesson.
- [ ] Add **Guided Course Mode** with a recommended sequence, a next lesson, and progress feedback. Add **Explore Mode** with direct access to every lesson and concept. Keep prerequisite links advisory in both modes.
- [ ] Support a 10–15 minute session for a focused lesson or exercise and a 30–60 minute session for a connected sequence of lessons, lab work, and practice.

### Practice, assessment, and progress

- [ ] Create calculation and prediction problems covering unknown voltage, current, or resistance, component substitutions, RC timing, MOSFET load drive, I²C pull-up selection, and LDO versus switching-regulator efficiency.
- [ ] Create diagnostic exercises where learners trace a circuit fault, interpret a datasheet specification, or find a design error in an embedded schematic. Give each exercise hints, feedback on incorrect answers, a worked solution, and a retry.
- [ ] Add an entry diagnostic quiz to identify rusty topics. Use assessment performance to recommend specific next lessons and offer optional spaced repetition for concepts due for review.
- [ ] Extend the dashboard with course completion percentage, completed lessons and modules, scores and assessment history, concepts to revisit, bookmarks, saved notes, recommended lessons, and estimated study time remaining.

### Practical projects

Give each project a realistic circuit, engineering constraints, expected calculations, and a detailed solution that explains the design choices.

1. [ ] Design an LED circuit and select its current-limiting resistor.
2. [ ] Build and analyze a voltage divider.
3. [ ] Design an RC delay circuit.
4. [ ] Use a MOSFET to control an external load.
5. [ ] Design an MCU reset circuit.
6. [ ] Connect an I²C sensor to a microcontroller.
7. [ ] Review a 3.3 V power supply circuit.
8. [ ] Complete the full-board schematic review described below.

### Capstone, integration, and review

- [ ] Create a complete embedded-board schematic for project 8. Include an MCU, input power and regulation, decoupling, reset and boot circuitry, a clock source, I²C and SPI peripherals, GPIO-controlled loads, connectors, and protection components.
- [ ] Ask learners to identify functional blocks, explain component choices, calculate electrical parameters, identify design risks, and complete a structured schematic-review checklist. Provide automated feedback for questions with determinate answers and detailed model answers for open-ended engineering judgments.
- [ ] Share lesson and concept content across the Electronics Course, Reference Library, Circuit Playground, and Schematic Academy. Verify the capacitor lesson links to a working experiment, its reference entry, and a schematic showing decoupling in context.
- [ ] Apply the existing technical review standard to each course release. Verify formulas, diagram connectivity, numerical examples, and assessment solutions against authoritative sources. State model assumptions, approximations, component limits, and device-specific datasheet conditions. Check that learners must apply the concept to reach a defensible answer.
