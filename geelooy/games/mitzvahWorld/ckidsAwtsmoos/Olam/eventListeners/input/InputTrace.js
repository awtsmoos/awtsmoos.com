// B"H
/** InputTrace keeps movement history light but visible to proof. */
export function trace(olam, stage, payload = {}) { const at = Date.now(); olam.__movementTrace ||= []; olam.__movementTrace.push({ at, stage, ...payload }); olam.__movementTrace = olam.__movementTrace.slice(-80); }
export function positionOf(entity) { return entity?.mesh?.position || entity?.modelMesh?.position || entity?.position || null; }
export function nearPlayer(olam, entity, max = 6) { const a = positionOf(olam.player || olam.chossid), b = positionOf(entity); return Boolean(a && b && a.distanceTo?.(b) <= max); }
