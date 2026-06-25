// B"H
function around(missions = [], input = {}, env, registry = null) {
  const query = norm(input.projectRoot || input.root || input.directory || input.path || input.q || '');
  const fromMissions = missions.filter(m => m.room || m.collaboration).map(m => scoreMission(m, query));
  const fromRegistry = (registry?.rooms || []).map(r => scoreRoom(r, query));
  const rooms = dedupe([...fromMissions, ...fromRegistry]).filter(x => x.score > 0 || !query).sort((a, b) => b.score - a.score || String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return { query, count: rooms.length, rooms, registryCount: fromRegistry.length, mustCallNext: rooms[0] ? { action: 'missionRoomJoin', missionId: rooms[0].missionId, agentId: input.agentId || 'agent', role: input.role || 'joining existing room' } : null };
}
function scoreMission(m, query) {
  const room = m.room || {};
  const values = [room.projectRoot, m.metadata?.projectRoot, m.metadata?.root, m.goal, m.id].map(norm).filter(Boolean);
  return pack({ missionId: m.id, roomId: room.id || '', name: room.name || m.goal, projectRoot: room.projectRoot || m.metadata?.projectRoot || '', updatedAt: m.updatedAt, agents: Object.keys(room.agents || {}).length, messages: (room.messages || []).length, subMissions: (room.subMissions || []).length }, values, query);
}
function scoreRoom(room, query) {
  const values = [room.projectRoot, room.name, room.roomId, room.missionId].map(norm).filter(Boolean);
  return pack({ missionId: room.missionId, roomId: room.roomId, name: room.name, projectRoot: room.projectRoot, updatedAt: room.updatedAt, agents: (room.agents || []).length, messages: room.messages || 0, subMissions: room.subMissions || 0, source: 'central_registry' }, values, query);
}
function pack(base, values, query) {
  const exact = values.some(v => v === query) ? 100 : 0;
  const contains = values.some(v => query && (v.includes(query) || query.includes(v))) ? 50 : 0;
  const depth = Math.max(0, ...values.map(v => commonPrefix(v, query).length));
  return { ...base, score: exact + contains + depth };
}
function dedupe(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.roomId || item.missionId;
    if (!map.has(key) || map.get(key).score < item.score) map.set(key, item);
  }
  return [...map.values()];
}
function norm(v) { return String(v || '').trim().toLowerCase().replace(/\/+$/,''); }
function commonPrefix(a, b) { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return a.slice(0, i); }
module.exports = { around };
