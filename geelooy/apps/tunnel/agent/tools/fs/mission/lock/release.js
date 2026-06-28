// B"H
const Store = require('./store.js');
const Config = require('./config.js');
function canRelease(result = {}) { return result.action === 'missionFinalize' && result.finalAnswerAllowed === true && result.mustContinue !== true; }
function release(config, result = {}) { const lock = Store.get(config); if (!lock) return null; lock.releaseAllowed = true; lock.releaseStatus = Config.RELEASED; lock.releasedAt = Config.now(); lock.releaseResult = { action: result.action, at: lock.releasedAt }; return Store.set(config, lock); }
module.exports = { canRelease, release };
