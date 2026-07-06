// B"H
const Policy = require('./policy.js');
const Discover = require('./discover.js');
const Block = require('./block.js');

/**
 * B"H
 * Mission presence is advisory by default. A caller can still request the legacy
 * exclusive gate for explicit mission-control flows, but ordinary safe actions
 * must not wait behind another agent's mission lock.
 */
async function check(config, payload = {}) {
  if (!hardExclusive(payload)) return null;
  if (!Policy.enabled(payload) || Policy.allowed(payload.action)) return null;
  const locks = await Discover.find(config, payload);
  return locks[0] ? Block.response(payload.action, locks[0]) : null;
}

function hardExclusive(payload = {}) {
  return payload.enforceMissionLock === true || payload.enforceMissionLock === 'true' ||
    process.env.AWTSMOOS_MISSION_HARD_EXCLUSIVE === '1';
}

module.exports = { check, Policy, Discover, hardExclusive };
