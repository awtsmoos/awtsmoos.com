// B"H
/**
 * Retired CPU skinner.
 *
 * The old experiment baked the bind pose into vertices and distorted the coat.
 * The living path now stays in GPU skinning: meshWorld * inverse(meshWorld) *
 * jointWorld * inverseBind. This module remains as a harmless breadcrumb so no
 * old import accidentally resurrects the exploded cloak.
 */
export function applyBindPoseSkinning(){return{skinnedMeshes:0,skinnedVertices:0,retired:true,reason:'GPU joint palette owns skinning now'};}
export default {applyBindPoseSkinning};
