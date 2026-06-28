// B"H
const Store = require('./store.js');
const N = require('./normalize.js');

function nextRoundAction(m, round) {
  return {
    action: 'missionRepeatBetter',
    missionId: m.id,
    previousRoundId: round.id,
    reason: 'all_next8_steps_reviewed_but_release_not_yet_confirmed',
    repeatCount: Store.ensure(m).rounds.length
  };
}

/**
 * B"H
 * Review now explains the doorway: next pending step, or repeat-better with a
 * reason visible to the next shliach instead of a silent circular hallway.
 */
function review(m, input = {}) {
  const round = Store.current(m), step = Store.byIndex(round, input.stepIndex);
  if (!round || !step) return { error: 'next8_step_not_found', round, step };
  step.evidence = N.list(input.evidence || input.proof || input.actual);
  step.status = input.blocked ? 'blocked' : 'done';
  step.updatedAt = new Date().toISOString();
  const next = Store.pending(round);
  round.status = next ? 'running' : 'review_ready';
  return {
    roundId: round.id,
    step,
    nextStep: next,
    transitionReason: next ? 'next8_step_pending' : 'round_complete_repeat_better_required_before_release',
    mustCallNext: next ?
      { action: 'missionExecuteNext8', missionId: m.id, roundId: round.id, stepIndex: next.index, reason: 'next8_step_pending' } :
      nextRoundAction(m, round)
  };
}

module.exports = { review, nextRoundAction };
