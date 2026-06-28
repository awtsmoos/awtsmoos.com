// B"H
const Lock = require('../lock/index.js');
const Mission = require('../index.js');

function active(m = {}) {
  return !!(m && m.releaseAllowed !== true);
}

async function missionExists(config, missionId) {
  if (!missionId) return false;
  try { return !!(await Mission.load(config, missionId)); } catch { return false; }
}

/**
 * B"H
 * A lock whose mission vanished is not a holy gate; it is stale smoke.
 * Clear it so agents are never trapped between mission_not_found and blockade.
 */
async function find(config, payload = {}) {
  const lock = Lock.active(config);
  if (!lock) return [];
  if (!(await missionExists(config, lock.missionId))) {
    try { Lock.clear(config); } catch {}
    return [];
  }
  const wanted = payload.missionId || payload.id || '';
  if (wanted && lock.missionId !== wanted) return [];
  return [lock];
}

module.exports = { active, find, missionExists };
