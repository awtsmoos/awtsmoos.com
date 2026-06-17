// B"H
export function compileMeshCollider(object = {}) { return { shape:"mesh", sourceMeshId:object.id, detail:object.collider?.detail || "coarse" }; }
