// B"H
/**
 * @module OlamProperties
 * @description
 * Chapter 40: Yesod Received The Quiet Input Vessel.
 *
 * The Awtsmoos gathers camera, scene, physics, input, state, and misc
 * properties into the living Olam. This import is cache-busted so RUNNING no
 * longer resurrects as true from an old browser module.
 */
import { getCameraProperties } from './CameraProperties.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { getSceneProperties } from './SceneProperties.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { getPhysicsProperties } from './PhysicsProperties.js?compact=true&v=lava-camera-axis-20260609-bh640';
import { getInputProperties } from './InputProperties.js?compact=true&v=village-combat-20260611-bh801';
import { getStateProperties } from './StateProperties.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { getMiscProperties } from './MiscProperties.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class OlamProperties {
    /** @param {object} olam Olam instance to fill with property vessels. */
    static apply(olam) {
        Object.assign(olam, getCameraProperties());
        Object.assign(olam, getSceneProperties());
        Object.assign(olam, getPhysicsProperties());
        Object.assign(olam, getInputProperties());
        Object.assign(olam, getStateProperties());
        Object.assign(olam, getMiscProperties());
    }
}
