
/**
 * B"H
 * @module OlamProperties
 * @description 
 * 🔯 THE GATHERING OF THE SEFIROT (YESOD) 🔯
 * 
 * Gathering all Sefirot into the central pillar (Yesod).
 * The monolithic properties object has been shattered to reveal the inner
 * specific nature of each domain.
 */
import { getCameraProperties } from './CameraProperties.js';
import { getSceneProperties } from './SceneProperties.js';
import { getPhysicsProperties } from './PhysicsProperties.js';
import { getInputProperties } from './InputProperties.js';
import { getStateProperties } from './StateProperties.js';
import { getMiscProperties } from './MiscProperties.js';

export default class OlamProperties {
    static apply(olam) {
        Object.assign(olam, getCameraProperties());
        Object.assign(olam, getSceneProperties());
        Object.assign(olam, getPhysicsProperties());
        Object.assign(olam, getInputProperties());
        Object.assign(olam, getStateProperties());
        Object.assign(olam, getMiscProperties());
    }
}
