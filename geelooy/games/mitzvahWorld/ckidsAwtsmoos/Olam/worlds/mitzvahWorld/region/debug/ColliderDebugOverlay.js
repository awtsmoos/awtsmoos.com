// B"H
/** @file ColliderDebugOverlay.js @description Debug overlay plan for merged colliders. */
export function colliderDebugOverlay(report){return {visible:false,hard:report?.summary?.hardColliders||0,color:0xff00ff};}
