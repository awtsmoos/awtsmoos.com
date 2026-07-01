// B"H
const { completionGate } = require('./gate.js');

/** B"H: handoff is a compact candle another agent can carry. */
function handoff(mission = {}) {
  return {
    missionId: mission.missionId,
    phase: mission.phase,
    status: mission.status,
    whatWasDone: completedCheckpoints(mission),
    whatWasNotDone: pendingCheckpoints(mission),
    filesInspected: mission.filesInspected || [],
    filesRewritten: mission.filesTouched || [],
    testsRun: mission.testsRun || [],
    testResults: mission.testResults || [],
    workers: mission.workers || [],
    receipts: mission.receipts || [],
    knownFailures: (mission.unresolved || []).concat(completionGate(mission).blockers),
    nextBestActions: pendingCheckpoints(mission).map(c => c.plainEnglish),
    warnings: mission.emergency?.status === 'active' ? ['emergency_mode_active'] : []
  };
}
function completedCheckpoints(mission) { return (mission.checkpoints || []).filter(c => c.status === 'complete').map(c => c.plainEnglish); }
function pendingCheckpoints(mission) { return (mission.checkpoints || []).filter(c => c.status !== 'complete'); }
module.exports = { handoff };
