// B"H
const Lock = require('./mission/lock/index.js');
const Mission = require('./mission/index.js');
const Offload = require('./actionOffload.js');
function missingAction() { return { ok:false, status:400, error:'missing_action' }; }
function unknownAction(action, actions) {
  return { ok:false, status:400, action, error:'Unknown fs action: ' + action, availableActions:Object.keys(actions).sort() };
}
async function healthyActive(config) {
  const active = Lock.active(config);
  if (!active?.missionId) return active;
  try { if (await Mission.load(config, active.missionId)) return active; } catch {}
  Lock.clear(config);
  return null;
}
async function runAction(action, actions) {
  const fn = actions[action];
  if (!fn) return unknownAction(action, actions);
  const result = await fn();
  if (!result || typeof result !== 'object') return { ok:false, status:502, action, error:'empty_action_response' };
  if (!result.action) result.action = action;
  return result;
}
async function maybeOffload(config, payload) { return Offload.maybe(config, payload); }
module.exports = { missingAction, unknownAction, healthyActive, runAction, maybeOffload };
