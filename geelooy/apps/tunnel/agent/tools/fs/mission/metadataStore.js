// B"H
const fs = require('fs');
const path = require('path');
const MetadataPath = require('./metadataPath.js');

function safe(v) { return String(v || 'item').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || 'item'; }
function stamp() { return new Date().toISOString(); }
function awdbCandidates() {
  return [
    path.join(__dirname, '..', '..', '..', 'ayzarim', 'dosdb', 'awtsmoosBinary', 'awtsmoosdb', 'index.js'),
    path.join(__dirname, '../../../../../../../ayzarim/dosdb/awtsmoosBinary/awtsmoosdb/index.js')
  ];
}
function loadAwdb() {
  const tried = [];
  for (const candidate of awdbCandidates()) {
    tried.push(candidate);
    if (!fs.existsSync(candidate)) continue;
    return require(candidate);
  }
  const err = new Error(`awtsmoosdb_module_missing: ${tried.join(' | ')}`);
  err.code = 'AWTSMOOSDB_MODULE_MISSING';
  throw err;
}
function openAwdb(file) {
  const AwtsmoosDB = loadAwdb();
  const db = new AwtsmoosDB(file, { debug: false }); db.open(); return db;
}
function plain(value) { return value && value.__resolve__ ? value.__resolve__() : value; }
function withDb(config, input, fn) {
  const info = MetadataPath.report(config, input); fs.mkdirSync(info.metadataRoot, { recursive: true });
  const db = openAwdb(info.dbFile); try { return fn(db, info); } finally { db.close(); }
}
function encodeLine(record) { return `${record.at}|${record.kind}|${record.missionId}|${record.roomId || ''}|${Buffer.from(String(record.text || '')).toString('base64')}\n`; }
function entryFor(config = {}, m = {}, kind = 'event', input = {}) {
  return { id: input.id || `${safe(kind)}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 8)}`, at: input.at || stamp(), kind: safe(kind), missionId: m.id || input.missionId || 'mission', roomId: m.room?.id || input.roomId || '', agentId: input.agentId || input.fromAgent || '', projectRoot: input.projectRoot || config.root || '', text: input.text || input.body || input.message || input.subject || '', payload: input.payload || null };
}
function record(config = {}, m = {}, kind = 'event', input = {}) {
  const info = MetadataPath.report(config, input); fs.mkdirSync(info.metadataRoot, { recursive: true });
  const entry = entryFor(config, m, kind, input);
  try { return withDb(config, input, (db) => { writeRecord(db, entry); return { ok: true, backend: 'awtsmoosdb', metadata: info, record: entry }; }); }
  catch (error) { fs.appendFileSync(info.fallbackFile, encodeLine(entry), 'utf8'); return { ok: true, backend: 'awtsmoos-lines', metadata: info, record: entry, warning: String(error && error.message || error) }; }
}
function writeRecord(db, entry) {
  db.root.records ||= {}; db.root.records[entry.id] = entry; db.root.latest = entry;
  db.root.collections ||= {}; db.root.collections[entry.kind] ||= {}; db.root.collections[entry.kind][entry.id] = entry;
}
function listRecords(config = {}, input = {}) {
  try { return withDb(config, input, (db, info) => ({ ok: true, backend: 'awtsmoosdb', metadata: info, records: recordsFrom(db, input) })); }
  catch (error) { return { ok: false, backend: 'awtsmoosdb', error: String(error && error.message || error), records: [] }; }
}
function recordsFrom(db, input = {}) {
  const all = db.root.records ? db.keys(db.root.records).map(k => plain(db.root.records[k])) : [];
  return all.filter(r => !input.missionId || r.missionId === input.missionId).filter(r => !input.roomId || r.roomId === input.roomId).filter(r => !input.kind || r.kind === safe(input.kind)).sort((a, b) => String(a.at || '').localeCompare(String(b.at || ''))).slice(-limit(input));
}
function upsertRoom(config = {}, m = {}, input = {}) {
  const room = m.room || {}; const key = safe(room.id || input.roomId || m.id);
  const entry = { roomId: room.id || input.roomId || '', missionId: m.id || input.missionId || '', name: room.name || m.goal || '', projectRoot: room.projectRoot || input.projectRoot || m.metadata?.projectRoot || config.root || '', updatedAt: stamp(), agents: Object.keys(room.agents || {}), messages: (room.messages || []).length, subMissions: (room.subMissions || []).length, blockingInterrupts: (room.interrupts || []).filter(x => x.status === 'blocking').length };
  try { return withDb(config, input, (db, info) => { db.root.activeRooms ||= {}; db.root.activeRooms[key] = entry; return { ok: true, backend: 'awtsmoosdb', metadata: info, room: entry }; }); }
  catch (error) { return { ok: false, backend: 'awtsmoosdb', error: String(error && error.message || error), room: entry }; }
}
function activeRooms(config = {}, input = {}) {
  try { return withDb(config, input, (db, info) => { const rooms = db.root.activeRooms ? db.keys(db.root.activeRooms).map(k => plain(db.root.activeRooms[k])) : []; return { ok: true, backend: 'awtsmoosdb', metadata: info, rooms }; }); }
  catch (error) { return { ok: false, backend: 'awtsmoosdb', error: String(error && error.message || error), rooms: [] }; }
}
function status(config = {}, input = {}) {
  const info = MetadataPath.report(config, input); const files = fs.existsSync(info.metadataRoot) ? fs.readdirSync(info.metadataRoot) : [];
  const registry = activeRooms(config, input); return { ok: true, ...info, exists: fs.existsSync(info.metadataRoot), files, hasJsonFiles: files.some(f => f.endsWith('.json')), activeRooms: registry.rooms || [] };
}
function limit(input) { const n = Number(input.limit || 500); return Number.isFinite(n) ? Math.max(1, Math.min(5000, n)) : 500; }
module.exports = { record, listRecords, status, upsertRoom, activeRooms, path: MetadataPath, awdbCandidates };
