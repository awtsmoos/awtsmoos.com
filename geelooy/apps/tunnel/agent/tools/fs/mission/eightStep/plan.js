// B"H
const N = require('./normalize.js');
const Store = require('./store.js');
const Work = require('../workQueue/index.js');
function create(m, input = {}) {
  const q = Work.refresh(m, input);
  const available = (q.items || []).filter(x => x.status !== 'done');
  const round = {
    id: `next8_${Date.now().toString(36)}`,
    missionId: m.id,
    title: String(input.title || 'Next 8 concrete work steps'),
    betterThan: input.previousRoundId || '',
    createdAt: new Date().toISOString(),
    status: 'planned',
    workQueueProgress: Work.summary(m),
    steps: N.steps(input, available)
  };
  Store.addRound(m, round);
  return {
    round,
    next8Steps: round.steps,
    workQueue: Work.summary(m),
    missionWorkLoop: 'plan -> inspect/read -> write complete files -> live verify -> review -> shrink debt -> continue',
    mustCallNext: { action: 'missionExecuteNext8', missionId: m.id, roundId: round.id, stepIndex: 0, reason: 'concrete_work_step_pending' }
  };
}
module.exports = { create };
