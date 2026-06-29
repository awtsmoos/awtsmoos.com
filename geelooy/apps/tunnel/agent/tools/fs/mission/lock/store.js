// B"H
const { withDb } = require('../../awdb/open.js');
const C = require('../../awdb/collections.js');
const Config = require('./config.js');
function box(db) { return C.ensure(db.root, 'missionLocks'); }
function get(config) { try { return withDb(config, 'missions', db => C.plain(box(db)[Config.key(config)])); } catch { return null; } }
function set(config, lock) { return withDb(config, 'missions', db => { box(db)[Config.key(config)] = C.plain(lock); return C.plain(lock); }); }
function clear(config) { return withDb(config, 'missions', db => { delete box(db)[Config.key(config)]; return true; }); }
function all(config) { try { return withDb(config, 'missions', db => C.values(box(db))); } catch { return []; } }
module.exports = { get, set, clear, all };
