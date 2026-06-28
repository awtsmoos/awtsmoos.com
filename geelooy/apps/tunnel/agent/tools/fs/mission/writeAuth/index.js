// B"H
const Create = require('./create.js'); const Store = require('./store.js');
function grant(config, lock, payload = {}) { return Store.add(config, Create.create(lock, payload)); }
function verify(config, lock = {}, payload = {}) { const token = payload.missionWriteToken || payload.writeToken || '', got = token && Store.get(config, token); if (!got || got.used || got.missionId !== lock.missionId) return false; if (Date.parse(got.expiresAt || 0) < Date.now()) return false; if (got.action && got.action !== payload.action) return false; const path = payload.path || payload.p || ''; if (got.path && path && got.path !== path) return false; Store.use(config, token); return true; }
module.exports = { grant, verify, get:Store.get };
