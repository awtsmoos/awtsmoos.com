// B"H
const Lock = require('../lock/index.js');
function active(m = {}) { return !!(m && m.releaseAllowed !== true); }
async function find(config, payload = {}) { const lock = Lock.active(config); if (!lock) return []; const wanted = payload.missionId || payload.id || ''; if (wanted && lock.missionId !== wanted) return []; return [lock]; }
module.exports = { active, find };
