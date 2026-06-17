// B"H
export function compileBoxCollider(object = {}, transform = {}) { return { shape:"box", size:object.collider?.size || transform.scale || [1,1,1] }; }
