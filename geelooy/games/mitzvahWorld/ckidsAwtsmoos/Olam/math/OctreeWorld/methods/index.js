// B"H
/**
 * @module OctreeWorld_Methods_Hub
 * @description
 * Chapter 635: The collision world imports the automatic simplified-collider
 * inserter. Solid visuals become exact world-box bodies before octree.
 */
import addObject from './addObject.js?v=simplified-solid-colliders-20260609-bh634';
import removeMesh from './removeMesh.js';
import update from './update.js';
import fromGraphNode from './fromGraphNode.js';
import insert from './insert.js?v=world-pose-collider-clones-20260605-bh448';
import building from './building/index.js';
import internalHelpers from './internal/index.js';
import queries from './queries/index.js';
export default { ...addObject, ...removeMesh, ...update, ...fromGraphNode, ...insert, ...building, ...internalHelpers, ...queries };
