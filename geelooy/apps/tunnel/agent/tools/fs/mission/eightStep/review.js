// B"H
const Store = require('./store.js');
const N = require('./normalize.js');
function review(m, input = {}) {
  const round = Store.current(m), step = Store.byIndex(round, input.stepIndex);
  if (!round || !step) return { error: 'next8_step_not_found', round, step };
  step.evidence = N.list(input.evidence || input.proof || input.actual); step.status = input.blocked ? 'blocked' : 'done'; step.updatedAt = new Date().toISOString();
  const next = Store.pending(round);
  round.status = next ? 'running' : 'review_ready';
  return { roundId: round.id, step, nextStep: next, mustCallNext: next ? { action: 'missionExecuteNext8', missionId: m.id, roundId: round.id, stepIndex: next.index } : { action: 'missionRepeatBetter', missionId: m.id, previousRoundId: round.id } };
}
module.exports = { review };
