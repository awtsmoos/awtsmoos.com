// B"H
/** @file GroundedColliderBuilder.js @description Collision is real, grounded, door-aware, and cheap. */
function box(c,groundAt){ return { ...c, y:groundAt(c.x||0,c.z||0), grounded:true, merged:true, size:c.size || [c.sx||1,c.sy||1,c.sz||1] }; }
export function buildGroundedColliderSpecs(classification={}, groundAt=()=>0){ const hard=(classification.hard||[]).map(c=>box(c,groundAt)); const doors=(classification.doors||classification.door||[]).filter(d=>!d.open).map(c=>box({ ...c, category:c.category||"closed-door" },groundAt)); return [...hard,...doors]; }
export function colliderBudgetSummary(colliders=[]){ return { colliders:colliders.length, hard:colliders.filter(c=>c.category!=="closed-door").length, doors:colliders.filter(c=>c.category==="closed-door").length, budgetOk:colliders.length<=140 }; }
export default { buildGroundedColliderSpecs, colliderBudgetSummary };
