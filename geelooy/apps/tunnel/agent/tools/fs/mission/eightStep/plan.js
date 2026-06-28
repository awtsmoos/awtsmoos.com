// B"H
const N = require('./normalize.js');
const Store = require('./store.js');
function create(m, input = {}) {
  const round = { id: `next8_${Date.now().toString(36)}`, missionId: m.id, title: String(input.title || 'Next 8 steps'), betterThan: input.previousRoundId || '', createdAt: new Date().toISOString(), status: 'planned', steps: N.steps(input) };
  Store.addRound(m, round);
  return { round, next8Steps: round.steps, mustCallNext: { action: 'missionExecuteNext8', missionId: m.id, roundId: round.id, stepIndex: 0 } };
}
module.exports = { create };
