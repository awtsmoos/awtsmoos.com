
import { ZoomProcessor } from '../vessels/camera/ZoomProcessor.js';

/**
 * B"H
 * CHAPTER: THE REFINEMENT OF THE SCROLL
 * 
 * This function is the point of entry for the 'wheel' signal. It ensures the 
 * camera distance is updated with the refined, contracted intensity.
 * 
 * @function handleWheelSignal
 * @param {Object} state - The current state of the Olam (world).
 * @param {Object} payload - The data from the wheel event.
 */
export function handleWheelSignal(state, payload) {
    if (!state.camera || !state.cameraControls) return;

    // B"H - We extract the raw delta.
    const rawDelta = payload.deltaY || 0;

    // B"H - We process it through the lens of sensitivity.
    const currentDist = state.cameraControls.distance;
    const nextDist = ZoomProcessor.process(rawDelta, currentDist);

    // B"H - We update the camera's tether.
    state.cameraControls.distance = nextDist;
    
    // B"H - Signal that the vessel has moved.
    state.cameraControls.needsUpdate = true;
}
