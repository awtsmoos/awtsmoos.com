// B"H
/** @module OctreeWorld_Methods_Hub @description Compact-cached octree method hub. */
import addObject from './addObject.js?compact=true&v=simplified-solid-colliders-20260609-bh634';
import removeMesh from './removeMesh.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import update from './update.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import fromGraphNode from './fromGraphNode.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import insert from './insert.js?compact=true&v=world-pose-collider-clones-20260605-bh448';
import building from './building/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import internalHelpers from './internal/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import queries from './queries/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export default { ...addObject, ...removeMesh, ...update, ...fromGraphNode, ...insert, ...building, ...internalHelpers, ...queries };
