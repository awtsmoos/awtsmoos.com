// B"H
/** @file GroundedColliderBuilder.js @description Builds grounded collider boxes after terrain sampling. */
export function buildGroundedColliderSpecs(classification,groundAt=()=>0){return (classification.hard||[]).map(c=>({...c,y:groundAt(c.x,c.z),merged:true}));}
