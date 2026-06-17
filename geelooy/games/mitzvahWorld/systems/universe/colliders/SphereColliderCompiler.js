// B"H
export function compileSphereCollider(object = {}, transform = {}) { return { shape:"sphere", radius:object.collider?.radius || Math.max(...(transform.scale || [1])) / 2 }; }
