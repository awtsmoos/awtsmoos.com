// B"H
const Store = require('./store.js');
function fromLock(config, lock = {}) { return Store.write(config, { missionId: lock.missionId, active: lock.releaseAllowed !== true, releaseStatus: lock.releaseStatus || 'locked', next: lock.lastMustCallNext || null, at: new Date().toISOString() }); }
module.exports = { fromLock, write: Store.write, read: Store.read };
