
/**
 * B"H
 * @module PhysicsProperties
 * @description 
 * 🧱 THE BOUNDARIES OF REALITY (GEVURAH) 🧱
 * 
 * Holds the Octrees and gravitational constants.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { OctreeWorld as Octree } from '../math/OctreeWorld/index.js?v=lava-camera-axis-20260609-bh640';

export const getPhysicsProperties = () => ({
    worldOctree: new Octree(),
    interactiveOctree: new Octree(),
    octreeDebugHelper: new THREE.Box3Helper(new THREE.Box3(), 0xff0000),
    GRAVITY: 30,
    STEPS_PER_FRAME: 5
});
