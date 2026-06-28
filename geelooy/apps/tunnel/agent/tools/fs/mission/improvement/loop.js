// B"H
const D = require('./discover.js');
const S = require('./score.js');
const Sim = require('./simulate.js');
const T = require('./transaction.js');
const Dash = require('./dashboard.js');
function run(config={}, payload={}) {
  const report = D.discover(config, payload);
  const ranked = S.rank(report, Number(payload.limit || 20));
  const simulation = Sim.simulate(ranked, payload);
  const transaction = T.create(simulation, payload);
  const dashboard = Dash.dashboard(report, ranked, transaction);
  return { ...dashboard, simulation, transaction, mustContinue:true, finalAnswerAllowed:false, mustCallNext: simulation[0]?.action || { action:'missionDaemonTick', reason:'no_improvement_action_found' } };
}
module.exports = { run };
