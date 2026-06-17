// B"H
export function colliderInstallPacket(collider = {}) { return { kind:"collider_install", id:collider.id, targetId:collider.targetId, shape:collider.shape, transform:collider.transform, collider:collider.collider || null, exactTransformMirror:collider.exactTransformMirror === true, tags:collider.tags || [] }; }
export function colliderInstallPackets(colliders = []) { return colliders.map(colliderInstallPacket); }
