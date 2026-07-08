
// B"H
/**
 * @module OctreeWorld_Internal
 * @description
 * ⚙️ THE HIDDEN GEARS OF THE COSMOS ⚙️
 */
import buildNodePhysics from './buildNodePhysics.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import distributeTriangleToNodes from './distributeTriangleToNodes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import enforceCriticalPath from './enforceCriticalPath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import helpers from './helpers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import queues from './queues.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import synchronouslyRebuildNode from './synchronouslyRebuildNode.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import treeMutations from './treeMutations.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    ...buildNodePhysics,
    ...distributeTriangleToNodes,
    ...enforceCriticalPath,
    ...helpers,
    ...queues,
    ...synchronouslyRebuildNode,
    ...treeMutations
};
