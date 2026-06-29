// B"H
const Config = require('./config.js');
function next(missionId, payload = {}) { if (!Config.enabled(payload)) return null; return { action: 'missionNext8Plan', missionId, steps: payload.steps || Config.STEPS }; }
module.exports = { next, enabled: Config.enabled };
