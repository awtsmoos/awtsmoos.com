// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const BT = require("../continuation/boundedTick.js");

// Disposable fixture mission: next-step stub, no real mission, no autonomy.
function fixture(steps) { let i = 0; return { next: () => steps[Math.min(i++, steps.length - 1)] }; }
const cont = { keepGoing: true, done: false, verdict: "continue" };

// One-hour tick is bounded by maxSteps and asks for an explicit re-call.
let tick = BT.tick(fixture([cont]), { maxSteps: 3 }, "oneHour");
assert.equal(tick.stepsRun, 3); assert.equal(tick.windowMs, 3600000);
assert.equal(tick.done, false); assert.equal(tick.mustCallNext, true);
assert.equal(tick.nextAction, "missionContinueOneHour"); assert.equal(tick.bounded, true);

// Until-gate tick stops at the gate verdict, and at real completion.
tick = BT.tick(fixture([cont, { keepGoing: true, done: false, verdict: "gate_reached" }, cont]), {}, "untilGate");
assert.equal(tick.stepsRun, 2); assert.equal(tick.gateReached, true); assert.equal(tick.mustCallNext, false);
tick = BT.tick(fixture([cont, { keepGoing: false, done: true, verdict: "done" }]), {}, "untilGate");
assert.equal(tick.done, true); assert.equal(tick.mustCallNext, false); assert.equal(tick.nextAction, null);

// Windows never widen: one-hour is capped, maxSteps is capped at 64.
assert.equal(BT.windowFor("oneHour", { windowMs: 99999999 }).windowMs, 3600000);
assert.equal(BT.tick(fixture([cont]), { maxSteps: 9999 }, "oneHour").stepsRun, 64);

// The direct handlers exist by name and delegate to the bounded tick.
const src = fs.readFileSync(path.join(__dirname, "../actionGroups/missionActions.js"), "utf8");
assert.ok(src.includes("async missionContinueOneHour()")); assert.ok(src.includes("async missionContinueUntilGate()"));
assert.ok(src.includes("BT.tick")); assert.ok(!src.includes("setInterval"));
console.log("B'H continuation bounded tick + Continue* handlers ok");
