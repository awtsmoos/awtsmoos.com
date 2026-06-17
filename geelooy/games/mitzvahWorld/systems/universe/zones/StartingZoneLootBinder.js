// B"H
export function bindLootToMeshes(meshes = [], lootTables = []) { const byTarget = new Map(lootTables.map(l => [l.animalId || l.targetId || l.id, l])); return meshes.map(mesh => ({ meshId:mesh.id, loot:byTarget.get(mesh.id) || byTarget.get(mesh.source?.id) || null })).filter(x => x.loot); }
