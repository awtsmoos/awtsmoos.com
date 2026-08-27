
/**
 * B"H
 * THE EYE OF THE SOUL (CAMERA UNPROJECTOR)
 * 
 * Chapter: The Restoration of Sight
 * Previously, the Camera forgot where it sat in the universe, defaulting 
 * to the origin [0,0,0]. This caused it to instantly collide with any 
 * vessel resting at the center of creation!
 * 
 * We now restore the capacity to read the Spherical State of the Camera 
 * (Radius, Alpha, Beta) to calculate its exact absolute origin.
 * 
 * Furthermore, we cast the Ray using the "Far Point" method. We take the 
 * click, push it to the very edge of the universe (Clip Z = 1.0), unproject 
 * it to World Space, and draw our perfect line of intent.
 * 
 * @class CameraUnprojector
 */
import { RayMath } from '../math/rayMath.js';
import { Ray } from '../core/ray.js';

export class CameraUnprojector {
    /**
     * B"H
     * Forges the True Ray from the 2D screen coordinate.
     * @param {number} ndcX - Screen X in range [-1, 1]
     * @param {number} ndcY - Screen Y in range [-1, 1]
     * @param {Object} camera - The divine lens
     * @returns {Ray|null} The Line of Infinite Light
     */
    static unproject(ndcX, ndcY, camera) {
        const proj = camera.projectionMatrix || camera.projection;
        const view = camera.viewMatrix || camera.view;

        if (!proj || !view) {
            console.error("B\"H - CameraUnprojector: Missing Camera Matrices!");
            return null;
        }

        // 1. EXTRACT THE ABSOLUTE ORIGIN (THE EYE)
        let origin = [0, 0, 0];
        
        if (camera.state && typeof camera.state.radius === 'number') {
            // Unpack the spherical orbit state
            const r = camera.state.radius;
            const a = camera.state.alpha || 0;
            const b = camera.state.beta || 0;
            const t = camera.state.target || [0, 0, 0];

            const rCosB = r * Math.cos(b);
            origin[0] = t[0] + rCosB * Math.sin(a);
            origin[1] = t[1] + r * Math.sin(b);
            origin[2] = t[2] + rCosB * Math.cos(a);
        } else if (camera.position) {
            // Fallback for direct positioning
            origin = [
                camera.position[0] ?? camera.position.x ?? 0, 
                camera.position[1] ?? camera.position.y ?? 0, 
                camera.position[2] ?? camera.position.z ?? 0
            ];
        } else if (typeof camera.getPosition === 'function') {
            const pos = camera.getPosition();
            origin = [pos[0] || 0, pos[1] || 0, pos[2] || 0];
        }

        // 2. INVERT THE MATRICES (TZIMTZUM REVERSED)
        const invProj = RayMath.invert4x4(proj);
        const invView = RayMath.invert4x4(view);

        if (!invProj || !invView) return null;

        // 3. UNPROJECT THE FAR HORIZON
        // We push the NDC coordinate to the Far Plane (z = 1.0, w = 1.0)
        const farClip = [ndcX, ndcY, 1.0, 1.0];
        
        // Transform to Eye Space
        const farEye = RayMath.transformVec4(invProj, farClip);
        
        // Perspective Divide (Crucial for correct spatial projection)
        const wE = farEye[3] !== 0 ? 1.0 / farEye[3] : 1.0;
        farEye[0] *= wE;
        farEye[1] *= wE;
        farEye[2] *= wE;
        farEye[3] = 1.0; // Now a pure point in eye space

        // Transform Eye Space to World Space
        const farWorld4 = RayMath.transformVec4(invView, farEye);
        const farWorld = [farWorld4[0], farWorld4[1], farWorld4[2]];

        // 4. THE DIRECTION OF INTENT
        // The Intent is simply the normalized line from the Eye to the Horizon
        const direction = RayMath.normalize(RayMath.sub(farWorld, origin));

        return new Ray(origin, direction);
    }
}
