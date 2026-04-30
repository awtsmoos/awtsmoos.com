
// B"H
/**
 * @module ZoomOrchestrator
 * @description
 * 🔍 CHAPTER 23: THE FOCAL DESCENT (TIKKUN) 🔍
 * 
 * Chapter 230: Expanding and Contracting.
 * 
 * Perception is not static. The soul chooses to draw near or wander afar.
 * We have updated the zoom laws to handle the "Pinch" decree from the 
 * mobile matrix. By refining the scalar factor, zooming becomes a fluid 
 * experience rather than a jagged sequence of steps.
 */

export default class ZoomOrchestrator {
    /**
     * @method applyZoom
     * @description Alters the depth of perception based on Wheel or Pinch input.
     * @param {Object} ayin - The `Ayin` (Camera) instance.
     * @param {number} rawDeltaY - The raw movement force.
     */
    static applyZoom(ayin, rawDeltaY) {
        if (typeof rawDeltaY !== 'number' || isNaN(rawDeltaY) || rawDeltaY === 0) return;

        ayin.newMovement = true;
        
        // B"H: THE REFINEMENT
        // Use a subtle multiplier to emulate analog fluidity.
        const multiplier = ayin.zoomRate || 0.003; 
        const amount = rawDeltaY * multiplier; 
        
        ayin.desiredDistance += amount;
        
        // B"H: ABSOLUTE BOUNDARIES
        // Do not allow the gaze to wander past the FAR plane 
        // or pierce the innermost heart (Kesser) of the target.
        ayin.desiredDistance = Math.max(
            ayin.minDistance, 
            Math.min(ayin.maxDistance, ayin.desiredDistance)
        );
    }
}
