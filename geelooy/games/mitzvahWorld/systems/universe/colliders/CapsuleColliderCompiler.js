// B"H
export function compileCapsuleCollider(object = {}, transform = {}) { return { shape:"capsule", radius:object.collider?.radius || .35, height:object.collider?.height || (transform.scale?.[1] || 1.8) }; }
