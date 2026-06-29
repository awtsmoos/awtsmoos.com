// B"H
const Loop = require('../mission/improvement/loop.js');
const D = require('../mission/improvement/discover.js');
const S = require('../mission/improvement/score.js');
const Sim = require('../mission/improvement/simulate.js');
const Tx = require('../mission/improvement/transaction.js');
const Dash = require('../mission/improvement/dashboard.js');

/**
 * B"H
 * Continuous improvement gates: the mission looks at the codebase, scores the
 * next work, simulates cost, wraps it in a transaction, and tells the agent the
 * next real action instead of drifting back into empty repetition.
 */
function buildMissionImprovementActions(ctx) {
  const { config, payload } = ctx;
  return {
    missionImprovementPlan: async () => Loop.run(config, payload),
    missionImprovementDashboard: async () => dashboard(config, payload),
    missionSimulateNext: async () => simulate(config, payload),
    missionTransactionPlan: async () => transaction(config, payload)
  };
}
function base(config, payload) {
  const report = D.discover(config, payload);
  const ranked = S.rank(report, Number(payload.limit || 20));
  const simulation = Sim.simulate(ranked, payload);
  return { report, ranked, simulation };
}
function dashboard(config, payload) {
  const { report, ranked, simulation } = base(config, payload);
  return Dash.dashboard(report, ranked, Tx.create(simulation, payload));
}
function simulate(config, payload) {
  const { simulation } = base(config, payload);
  return { ok:true, action:'missionSimulateNext', simulation, mustCallNext:simulation[0]?.action || null };
}
function transaction(config, payload) {
  const { simulation } = base(config, payload);
  return { ok:true, action:'missionTransactionPlan', transaction:Tx.create(simulation, payload) };
}
module.exports = { buildMissionImprovementActions, base, dashboard, simulate, transaction };
