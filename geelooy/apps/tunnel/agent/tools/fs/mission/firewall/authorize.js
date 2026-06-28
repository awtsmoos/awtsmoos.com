// B"H
const Classes = require('./classes.js'); const WriteAuth = require('../writeAuth/index.js');
function authorize(config, action, lock = {}, payload = {}) { const kind = Classes.classify(action); if (kind !== 'missionNeedsStepAuthorization') return { ok:true, kind }; if (payload.missionStepAuthorized === true || payload.missionStepAuthorized === 'true' || WriteAuth.verify(config, lock, payload)) return { ok:true, kind, authorized:true }; const grant = WriteAuth.grant(config, lock, { ...payload, targetAction:action }); return { ok:false, kind, error:'mission_step_authorization_required', missionId:lock.missionId, missionWriteToken:grant.token }; }
module.exports = { authorize };
