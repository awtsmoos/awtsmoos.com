// B"H
/** @module PhysicsProperties @description Octree and debug bounds without raw THREE import scatter. */
import { Box3, Box3Helper } from '../rendering/ThreeAdapter.js';
import { OctreeWorld as Octree } from '../math/OctreeWorld/index.js?v=lava-camera-axis-20260609-bh640';
export const getPhysicsProperties = () => ({ worldOctree:new Octree(), interactiveOctree:new Octree(), octreeDebugHelper:new Box3Helper(new Box3(), 0xff0000), GRAVITY:30, STEPS_PER_FRAME:5 });
export default getPhysicsProperties;
