// B"H
/** Mesh payloads without committing callers to THREE. */
export function meshSpec(kind, id, detail = {}) { return { adapter:"mesh", kind, id, detail }; }
export function buildingMeshSpec(command) { return meshSpec("building_placeholder", command.id, { title:command.title, owner:command.owner, purpose:command.purpose }); }
export function npcMeshSpec(command) { return meshSpec("npc_placeholder", command.id, { name:command.name, role:command.role, home:command.home, work:command.work }); }
