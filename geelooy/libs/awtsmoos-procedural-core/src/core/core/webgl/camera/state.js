
// B"H
/**
 * @file state.js
 * @brief Manages the properties and memory of camera vision.
 */
import { CAMERA_DEFAULTS } from './constants.js';

export class CameraState {
    constructor() {
        this.fov = CAMERA_DEFAULTS.FOV;
        this.near = CAMERA_DEFAULTS.NEAR;
        this.far = CAMERA_DEFAULTS.FAR;
        this.aspect = 1.0;

        this.radius = CAMERA_DEFAULTS.RADIUS;
        // B"H - The memory of the user's desired distance
        this.targetRadius = CAMERA_DEFAULTS.RADIUS; 
        
        this.alpha = CAMERA_DEFAULTS.ALPHA;
        this.beta = CAMERA_DEFAULTS.BETA;
        this.target = [...CAMERA_DEFAULTS.TARGET];
        this.up = [...CAMERA_DEFAULTS.UP];
        
        this.isDirty = true;
    }

    setAspect(width, height) {
        const newAspect = width / height;
        if (Math.abs(this.aspect - newAspect) > 0.001) {
            this.aspect = newAspect;
            this.isDirty = true;
        }
    }

    reset() {
        this.radius = CAMERA_DEFAULTS.RADIUS;
        this.targetRadius = CAMERA_DEFAULTS.RADIUS;
        this.alpha = CAMERA_DEFAULTS.ALPHA;
        this.beta = CAMERA_DEFAULTS.BETA;
        this.target =[...CAMERA_DEFAULTS.TARGET];
        this.isDirty = true;
        console.log('B"H - CameraState: Vision reset to harmonious defaults.');
    }
}
