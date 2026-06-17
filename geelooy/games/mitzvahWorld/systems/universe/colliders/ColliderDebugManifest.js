// B"H
export function colliderDebugManifest(colliders = []) { return colliders.map(c => ({ id:c.id, targetId:c.targetId, shape:c.shape, mirrored:c.exactTransformMirror })); }
