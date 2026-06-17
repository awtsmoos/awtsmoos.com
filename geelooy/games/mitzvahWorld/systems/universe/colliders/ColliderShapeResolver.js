// B"H
export function resolveColliderShape(object = {}) { if (object.collider?.shape) return object.collider.shape; if (["animal","zone_npc"].includes(object.type)) return "capsule"; if (["tree"].includes(object.type)) return "cylinder"; if (["mountain"].includes(object.type)) return "mesh"; return "box"; }
