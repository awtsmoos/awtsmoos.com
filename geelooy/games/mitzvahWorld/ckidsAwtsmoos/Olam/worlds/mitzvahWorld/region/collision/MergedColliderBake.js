// B"H
/** @file MergedColliderBake.js @description Conservative merged collider bake plan. */
export function mergedColliderBake(specs=[]){return {merged:true,count:specs.length,triangles:specs.length*12,octreeAction:'planned-single-merge'};}
