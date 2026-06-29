// B"H
const { withDb, dbFile } = require('../awdb/open.js');
const C = require('../awdb/collections.js');
function enabled() { return process.env.AWTSMOOS_MISSION_AWDB !== '0'; }
function save(config, mission) {
  if (!enabled()) return { ok: false, skipped: true };
  return withDb(config, 'missions', db => {
    const missions = C.ensure(db.root, 'missions');
    const byId = C.ensure(missions, 'byId');
    const order = C.ensure(missions, 'order');
    byId[mission.id] = C.plain(mission);
    order[mission.id] = mission.updatedAt || new Date().toISOString();
    return { ok: true, backend: 'awtsmoosdb', file: dbFile(config, 'missions'), id: mission.id };
  });
}
function load(config, id) {
  if (!enabled() || !id) return null;
  try { return withDb(config, 'missions', db => C.plain(C.ensure(C.ensure(db.root, 'missions'), 'byId')[id])); }
  catch { return null; }
}
function all(config) {
  if (!enabled()) return [];
  try { return withDb(config, 'missions', db => C.values(C.ensure(C.ensure(db.root, 'missions'), 'byId'))); }
  catch { return []; }
}
function status(config) { return { enabled: enabled(), file: dbFile(config, 'missions') }; }
module.exports = { save, load, all, status };
