// B"H
const Policy = require('./policy.js');
const Discover = require('./discover.js');
const Block = require('./block.js');
async function check(config, payload = {}) { if (!Policy.enabled(payload) || Policy.allowed(payload.action)) return null; const locks = await Discover.find(config, payload); return locks[0] ? Block.response(payload.action, locks[0]) : null; }
module.exports = { check, Policy, Discover };
