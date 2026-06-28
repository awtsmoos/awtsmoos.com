// B"H
const M = require('../mission/index.js');
const E = require('../mission/eightStep/index.js');
const P = require('./missionActionPayload.js');
const Lock = require('../mission/lock/index.js');
const WriteAuth = require('../mission/writeAuth/index.js');
const Firewall = require('../mission/firewall/index.js');
function mid(p = {}) { return p.missionId || p.id || ''; }
function bootNext(missionId = '') { return { action: 'missionBootResume', missionId, autoMission: true, tick: true, reason: 'mission_not_found_recovery' }; }
function recover(action, missionId) {
  try { Lock.clear({ root: process.cwd() }); } catch {}
  return { ok: false, action, error: 'mission_not_found', missionId: missionId || '', finalAnswerAllowed: false, mustContinue: true, mustCallNext: bootNext(missionId), recoveryExplanation: 'The requested mission id could not be loaded. Call missionBootResume so the live mission lock can be rebuilt or cleared.', missionExplanation: { phase: 'stale-mission-recovery', locked: true, chosenAction: 'missionBootResume', hardBlockers: ['mission_not_found'] } };
}
function risky(action = '') { return Firewall.classify(action) === 'missionNeedsStepAuthorization'; }
function attachWriteToken(config, out = {}) {
  const live = out.liveActionToPerform;
  if (!live || !risky(live.action)) return out;
  const lock = Lock.active(config) || { missionId: out.missionId || live.missionId || '' };
  if (!lock.missionId) return out;
  const grant = WriteAuth.grant(config, lock, { ...live, targetAction: live.action, path: live.path || live.p || '' });
  out.missionWriteToken = grant.token;
  out.liveActionToPerform = { ...live, missionWriteToken: grant.token, missionId: lock.missionId, missionStepAuthorized: true };
  out.authorizationExplanation = 'THIS WRITE STEP IS PART OF THE MISSION WORK LOOP. USE THE ATTACHED missionWriteToken ON THE LIVE ACTION PAYLOAD.';
  return out;
}
async function use(config, payload, fn) {
  const missionId = mid(payload), m = await M.load(config, missionId);
  if (!m) { try { Lock.clear(config); } catch {} return recover(payload.action, missionId); }
  const out = fn(m); await M.save(config, m); return attachWriteToken(config, out);
}
function focused(action, payload, out) {
  return { ok: !out.error, action, missionId: mid(payload), ...out, finalAnswerAllowed: false, mustContinue: true, mustCallNext: out.mustCallNext, missionWorkRequired: true };
}
function buildMissionEightStepActions(ctx) {
  const { config } = ctx, payload = P.mergedPayload(ctx.payload || {});
  return {
    async missionNext8Plan() { return use(config, payload, m => focused('missionNext8Plan', payload, E.plan(m, payload))); },
    async missionExecuteNext8() { return use(config, payload, m => focused('missionExecuteNext8', payload, E.execute(m, payload))); },
    async missionReviewNext8Step() { return use(config, payload, m => focused('missionReviewNext8Step', payload, E.review(m, payload))); },
    async missionRepeatBetter() { return use(config, payload, m => focused('missionRepeatBetter', payload, E.repeatBetter(m, payload))); }
  };
}
module.exports = { buildMissionEightStepActions, recover, bootNext, attachWriteToken };
