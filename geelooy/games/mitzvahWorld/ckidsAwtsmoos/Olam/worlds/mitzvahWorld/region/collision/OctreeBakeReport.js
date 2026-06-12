// B"H
/** @file OctreeBakeReport.js @description Collision audit report. */
export function octreeBakeReport(bake){return {ok:true,...bake,warning:'Actual octree mutation must happen only after visual grounding is verified.'};}
