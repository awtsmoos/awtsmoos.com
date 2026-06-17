// B"H
export function bindCollidersToMeshes(meshes = [], colliders = []) { const byTarget = new Map(colliders.map(c => [c.targetId, c])); return meshes.map(mesh => ({ meshId:mesh.id, collider:byTarget.get(mesh.id) || byTarget.get(mesh.source?.id) || null })); }
