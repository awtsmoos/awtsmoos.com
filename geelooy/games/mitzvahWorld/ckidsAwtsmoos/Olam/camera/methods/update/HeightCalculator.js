
// B"H
import { THREE } from '../../../rendering/ThreeAdapter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @module HeightCalculator
 * @description
 * Determines the focal center of the subject for the camera's tether.
 */
export default class HeightCalculator {
    /**
     * @function calculate
     * @param {Object} target - The entity being observed.
     * @param {number} fallbackHeight - The default height if measurement fails.
     * @returns {number} The Y-offset for the camera anchor.
     */
    static calculate(target, fallbackHeight = 1.5) {
        if (!target) return fallbackHeight;
        
        let targetHeadHeight = target.height || fallbackHeight;
        const measurementVessel = target.modelMesh || target.mesh;
        
        if (measurementVessel) {
            const boundingBox = new THREE.Box3().setFromObject(measurementVessel);
            if (boundingBox && !isNaN(boundingBox.max.y) && !isNaN(boundingBox.min.y)) {
                 const absoluteHeight = (boundingBox.max.y - boundingBox.min.y);
                 // B"H: Focusing the gaze down to the heart and mid-shoulders.
                 if (absoluteHeight > 0 && absoluteHeight < 4) {
                     targetHeadHeight = absoluteHeight * 0.55; 
                 }
            }
        }

        return Math.max(0.8, Math.min(targetHeadHeight, 2.2));
    }
}
