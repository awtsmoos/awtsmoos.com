// B"H
const { withDb } = require('../../awdb/open.js');
const C = require('../../awdb/collections.js');
const Lock = require('../lock/index.js');
const Classify = require('./classify.js');
function attach(config, payload = {}, result = {}) { const lock = Lock.active(config); if (!lock) return null; const receipt = { missionId: lock.missionId, ...Classify.summary(payload, result) }; withDb(config, 'missions', db => { const r = C.ensure(db.root, 'missionToolReceipts', []); r.push(receipt); }); return receipt; }
module.exports = { attach };
