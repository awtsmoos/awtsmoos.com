// B"H
/** @file CollisionTruthContract.js @description Declares what may and may not enter the octree. */
export const COLLISION_POLICY = Object.freeze({ visualOnly: "visualOnly", exactMeshCollider: "exactMeshCollider", measuredShellCollider: "measuredShellCollider", authoredCollider: "authoredCollider", interactiveOnly: "interactiveOnly" });
export function markVisualOnly(object, extra = {}) { Object.assign(object.userData ||= {}, { collisionPolicy: COLLISION_POLICY.visualOnly, skipOctree: true, noOctree: true, isSolid: false, ...extra }); return object; }
export function markCollider(object, policy = COLLISION_POLICY.authoredCollider, extra = {}) { Object.assign(object.userData ||= {}, { collisionPolicy: policy, addToOctree: true, isSolid: true, explicitCollision: true, ...extra }); return object; }
export function isVisualSolidViolation(object) { const d = object?.userData || {}; return (d.collisionPolicy === COLLISION_POLICY.visualOnly || d.masonryVisualOnly) && d.isSolid === true; }
export default { COLLISION_POLICY, markVisualOnly, markCollider, isVisualSolidViolation };
