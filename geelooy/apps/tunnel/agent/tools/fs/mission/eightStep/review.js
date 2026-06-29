// B"H
const Store = require('./store.js');
const N = require('./normalize.js');
const Work = require('../workQueue/index.js');
function nextRoundAction(m, round) {
  return { action: 'missionRepeatBetter', missionId: m.id, previousRoundId: round.id, reason: 'remaining_work_debt_or_release_not_confirmed', repeatCount: Store.ensure(m).rounds.length };
}
function evidence(input = {}) { return N.list(input.evidence || input.proof || input.actual || input.output || input.stdout || input.stderr); }
function review(m, input = {}) {
  const round = Store.current(m), step = Store.byIndex(round, input.stepIndex);
  if (!round || !step) return { error: 'next8_step_not_found', round, step };
  const before = Work.summary(m);
  step.evidence = evidence(input);
  step.status = input.blocked ? 'blocked' : 'done';
  step.updatedAt = new Date().toISOString();
  const after = Work.applyStep(m, step, { ...input, evidence: step.evidence, done: true });
  const next = Store.pending(round);
  round.status = next ? 'running' : 'review_ready';
  round.workQueueProgress = Work.summary(m);
  const debtShrank = Number(after.done || 0) > Number(before.done || 0) || Number(after.pending || 0) < Number(before.pending || 0);
  return {
    roundId: round.id,
    step,
    nextStep: next,
    workQueue: Work.summary(m),
    debtShrank,
    filesTouched: after.filesTouched || [],
    testsRun: after.testsRun || 0,
    transitionReason: next ? 'next_concrete_work_step_pending' : 'round_complete_find_remaining_work',
    mustCallNext: next ? { action: 'missionExecuteNext8', missionId: m.id, roundId: round.id, stepIndex: next.index, reason: 'next_concrete_work_step_pending' } : nextRoundAction(m, round)
  };
}
module.exports = { review, nextRoundAction, evidence };
