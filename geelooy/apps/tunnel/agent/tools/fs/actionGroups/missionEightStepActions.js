// B"H
const M = require('../mission/index.js');
const E = require('../mission/eightStep/index.js');
const P = require('./missionActionPayload.js');
function mid(p = {}) { return p.missionId || p.id || ''; }
async function use(config, payload, fn) { const m = await M.load(config, mid(payload)); if (!m) return { ok: false, action: payload.action, error: 'mission_not_found', missionId: mid(payload) }; const out = fn(m); await M.save(config, m); return out; }
function focused(action, payload, out) { return { ok: !out.error, action, missionId: mid(payload), ...out, finalAnswerAllowed: false, mustContinue: true, mustCallNext: out.mustCallNext }; }
function buildMissionEightStepActions(ctx) { const { config } = ctx; const payload = P.mergedPayload(ctx.payload || {}); return {
  async missionNext8Plan() { return use(config, payload, m => focused('missionNext8Plan', payload, E.plan(m, payload))); },
  async missionExecuteNext8() { return use(config, payload, m => focused('missionExecuteNext8', payload, E.execute(m, payload))); },
  async missionReviewNext8Step() { return use(config, payload, m => focused('missionReviewNext8Step', payload, E.review(m, payload))); },
  async missionRepeatBetter() { return use(config, payload, m => focused('missionRepeatBetter', payload, E.repeatBetter(m, payload))); }
}; }
module.exports = { buildMissionEightStepActions };
