// B"H
const Store = require('./store.js');
const Life = require('./lifecycle.js');
const Release = require('./release.js');
function active(config) { const lock = Store.get(config); return lock && lock.releaseAllowed !== true ? lock : null; }
function after(config, payload = {}, result = {}) { if (result.action === 'missionStart' && result.ok !== false) return Life.start(config, result, payload); if (Release.canRelease(result)) return Release.release(config, result); if (String(result.action || payload.action || '').startsWith('mission')) return Life.update(config, result, payload); return null; }
module.exports = { ...Store, active, after, start: Life.start, update: Life.update, canRelease: Release.canRelease, release: Release.release };
