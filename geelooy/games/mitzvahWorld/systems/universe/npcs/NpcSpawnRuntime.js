// B"H
export function npcSpawnPacket(npc = {}) { return { kind:"npc_spawn", id:npc.id, role:npc.role || "villager", dialogue:npc.dialogue || null, transform:npc.manual?.transform || null, source:npc }; }
export function npcSpawnPackets(objects = []) { return objects.filter(o => o.type === "zone_npc" || o.type === "npc_spawn").map(npcSpawnPacket); }
