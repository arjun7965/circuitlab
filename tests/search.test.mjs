import assert from "node:assert/strict";
import test from "node:test";
import { matchesSearch } from "../components/search.ts";
import { refs } from "../content/library.ts";
import { lessons } from "../content/lessons.ts";

test("Keyboard I2C finds the published I²C reference", () => {
  for (const query of ["I2C", "i²c", "  I2C   rise time  "]) {
    const found = refs.filter(row => matchesSearch(row.join(" "), query));
    assert.ok(found.some(row => row[0] === "I²C rise time"), query);
  }
});

test("Straight apostrophes find typographic lesson and reference titles", () => {
  assert.ok(lessons.some(lesson => matchesSearch(lesson.title, "Ohm's law")));
  assert.ok(refs.some(row => matchesSearch(row[0], "Ohm's law")));
});

test("Search keeps empty results and unmatched queries distinct", () => {
  assert.ok(refs.every(row => matchesSearch(row[0], "  ")));
  assert.ok(refs.every(row => !matchesSearch(row.join(" "), "no-such-circuit-xyz")));
});
