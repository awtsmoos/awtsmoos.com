// B"H
const assert = require("assert");
const mission = require("../index.js");
function test(name, fn) { try { fn(); console.log(`✓ ${name}`); } catch (error) { console.error(`✗ ${name}`); throw error; } }

test("stop guard rejects polite stopping while work remains", () => {
  const m = mission.createMission({ goal: "finish all tunnel work", remainingWork: ["inspect", "test"] });
  const verdict = mission.assertMayStop(m, "Would you like me to continue?");
  assert.equal(verdict.ok, false);
  assert.equal(verdict.prematureStop, true);
});

test("response rewriter turns stop attempt into continuation", () => {
  const m = mission.createMission({ goal: "finish all tunnel work", remainingWork: ["run next diagnostic"] });
  const result = mission.beforeFinalAnswer(m, "Let me know if you want me to keep going.");
  assert.equal(result.rewritten, true);
  assert.match(result.responseText, /continuing/i);
  assert.doesNotMatch(result.responseText, /Let me know/i);
});

test("blocker requires proof before asking user", () => {
  const noProof = mission.canAskUser({ reason: "requires your decision" });
  const withProof = mission.canAskUser({ reason: "requires your decision", safeActionsTried: ["inspected files"] });
  assert.equal(noProof, false);
  assert.equal(withProof, true);
});

test("autonomy loop supplies safe defaults", () => {
  const m = mission.createMission({ goal: "continue", remainingWork: ["next file"] });
  const defaults = mission.safeAutonomousDefaults(m);
  assert.ok(defaults.some(x => /inspect/.test(x)));
  assert.ok(defaults.some(x => /read-only test/.test(x)));
});
