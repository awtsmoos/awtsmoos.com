// B"H
const assert = require('assert');
const Covenant = require('../tools/fs/mission/continuationCovenant.js');
const FinalizePolicy = require('../tools/fs/mission/finalizePolicy.js');
function env(overrides = {}) {
  return {
    verify: () => overrides.verify || { ok: true, issues: [] },
    ContinuationQueue: { status: () => overrides.queue || { requiredOpen: 0, next: null } },
    CycleArtifacts: { status: () => overrides.cycles || { complete: 12, productiveMs: 3600000 } },
    ProtocolFinalizationGuard: { verdict: () => overrides.protocol || { ok: true, issues: [], status: null } },
    Innovation: { assess: () => overrides.innovation || { finalAnswerAllowed: true, reason: '' } }
  };
}
/**
 * B"H — The covenant became calm but firmer.
 * It does not shout at the agent. It tells the agent what remains possible,
 * keeps continuation fields hard, and leaves a narrow emergency door.
 */
(() => {
  const mission = { id: 'mission_lives', finalizationPolicy: {} };
  const blocked = FinalizePolicy.verdict(mission, { commandTreeEnded: true }, env());
  assert.equal(blocked.ok, false);
  assert.equal(blocked.finalAnswerAllowed, false);
  assert.equal(blocked.mustContinue, true);
  assert(blocked.issues.includes('user_release_approval_missing'));
  assert(blocked.issues.includes('command_tree_ended_is_not_release'));
  assert.match(blocked.checkpointMessage, /Checkpoint reached/i);
  assert.match(blocked.covenant.tunnelInstruction, /continue|steer/i);
  assert.notEqual(blocked.covenant.tunnelInstruction, blocked.covenant.tunnelInstruction.toUpperCase());
  const approved = FinalizePolicy.verdict(mission, { completedObjectiveApprovedByUser: true }, env());
  assert.equal(approved.ok, true);
  const stopped = FinalizePolicy.verdict(mission, { userStop: true }, env({ queue: { requiredOpen: 99, next: { id: 'q1' } } }));
  assert.equal(stopped.ok, true);
  assert.equal(stopped.stopReason, 'userStop');
  const testingStop = FinalizePolicy.verdict(mission, { emergencyStop: true, testing: true, reason: 'test harness needs controlled stop' }, env());
  assert.equal(testingStop.ok, true);
  assert.equal(testingStop.stopReason, 'testingEmergencyStop');
  const weakTestingStop = FinalizePolicy.verdict(mission, { emergencyStop: true, testing: true, reason: 'tired' }, env());
  assert.equal(weakTestingStop.ok, false);
  const response = Covenant.blockedResponse(mission, { issues: ['queue_empty_is_not_release'] });
  assert.equal(response.finalAnswerAllowed, false);
  assert.equal(response.mustContinue, true);
  assert.match(response.agentGuidance.plainEnglish, /continue|steer/i);
  console.log(JSON.stringify({ ok: true, suite: 'mission-unstoppable-covenant', checks: ['friendly-continuation', 'verified-stop', 'testing-emergency', 'hard-fields'] }, null, 2));
})();
