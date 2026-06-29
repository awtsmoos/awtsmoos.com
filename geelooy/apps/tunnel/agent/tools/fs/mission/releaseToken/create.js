// B"H
const crypto = require('crypto');
function create(lock = {}) { const seed = `${lock.missionId}|${lock.startedAt}|${lock.minimumUntil}|${Date.now()}`; return 'rel_' + crypto.createHash('sha256').update(seed).digest('hex').slice(0, 32); }
module.exports = { create };
