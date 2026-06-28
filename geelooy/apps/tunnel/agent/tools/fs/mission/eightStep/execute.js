// B"H
const Store = require('./store.js');
function run(m, input = {}) {
  const round = Store.current(m), step = Store.byIndex(round, input.stepIndex);
  if (!round || !step) return { error: 'next8_step_not_found', round, step };
  step.status = 'running'; step.updatedAt = new Date().toISOString();
  const nextIndex = step.index;
  return { roundId: round.id, step, instructions: ['Do this step completely.', 'Record evidence.', 'Call missionReviewNext8Step when done.'], mustCallNext: { action: 'missionReviewNext8Step', missionId: m.id, roundId: round.id, stepIndex: nextIndex } };
}
module.exports = { run };
