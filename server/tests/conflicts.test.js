import test from "node:test";
import assert from "node:assert/strict";
import { findConflicts, timesOverlap, sharedDays } from "../src/conflicts.js";

const sec = (id, days, start, end) => ({ id, days, start_min: start, end_min: end });

test("overlapping times on a shared day conflict", () => {
  const out = findConflicts([sec(1, "Mon,Wed", 600, 715), sec(2, "Wed", 700, 800)]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].days, ["Wed"]);
});

test("same times on different days do not conflict", () => {
  const out = findConflicts([sec(1, "Mon", 600, 715), sec(2, "Tue", 600, 715)]);
  assert.equal(out.length, 0);
});

test("back-to-back classes do not conflict", () => {
  assert.equal(timesOverlap(sec(1, "Mon", 600, 700), sec(2, "Mon", 700, 800)), false);
});

test("sharedDays finds intersection", () => {
  assert.deepEqual(sharedDays(sec(1, "Mon,Wed,Fri", 0, 1), sec(2, "Wed,Fri", 0, 1)), ["Wed", "Fri"]);
});
