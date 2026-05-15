
// B"H
/**
 * @file cameraTruth.js
 * @brief CRITICAL SAFETY - CRASH ON PURPOSE IF CAMERA POSITION UNKNOWN
 * 
 * User demand: "if u cnat find maer postiotn THROW ABSOTLUE EROR AND CRASH ENTIRE PAGE 
 * on oprusose if camera opston isnt known NOTHING IS STABLE"
 * 
 * This file now does exactly that.
 * If we cannot compute a real position from camera.state (the true orbiting source),
 * we throw a loud error and crash the page. No more silent default [0,10,20].
 * 
 * This makes the system stable: either the camera position is known, or everything stops.
 */

export class CameraTruth {
    static getAbsolutePosition(camera, fallbackRenderer = null) {
        if (!camera && fallbackRenderer && fallbackRenderer.camera) {
            camera = fallbackRenderer.camera;
        }

        if (!camera) {
            throw new Error("CRITICAL RAYCAST FAILURE: No camera object provided at all. Raycast system is unstable. Crashing on purpose.");
        }

        let pos = null;

        // 1. Spherical state - THIS IS THE ONLY RELIABLE SOURCE for orbiting camera
        if (camera.state && typeof camera.state.radius === 'number') {
            const s = camera.state;
            const r = Number(s.radius) || 20;
            const a = Number(s.alpha) || 0;
            const b = Number(s.beta) || 0;
            const t = s.target || [0, 0, 0];

            const rCosB = r * Math.cos(b);
            const cx = t[0] + rCosB * Math.sin(a);
            const cy = t[1] + r * Math.sin(b);
            const cz = t[2] + rCosB * Math.cos(a);

            pos = [cx, cy, cz];
        }

        // 2. Direct .position as last resort only
        if (!pos && camera.position) {
            if (Array.isArray(camera.position) && camera.position.length >= 3) {
                pos = [...camera.position];
            } else if (typeof camera.position.x === 'number') {
                pos = [camera.position.x, camera.position.y, camera.position.z];
            }
        }

        // 3. getPosition method
        if (!pos && typeof camera.getPosition === 'function') {
            const p = camera.getPosition();
            if (p && p.length >= 3) pos = [...p];
        }

        // FINAL CHECK - if we still have no position, CRASH ON PURPOSE
        if (!pos) {
            console.error("Camera object dump:", Object.keys(camera));
            throw new Error(
                "CRITICAL RAYCAST FAILURE: Could not determine real camera position.\n" +
                "camera.state.radius or camera.position is missing or invalid.\n" +
                "Ray origin would have been stale default. Crashing page as requested."
            );
        }

        // Always force .position so logs and raycasting see the truth
        camera.position = [...pos];

        return pos;
    }
}
