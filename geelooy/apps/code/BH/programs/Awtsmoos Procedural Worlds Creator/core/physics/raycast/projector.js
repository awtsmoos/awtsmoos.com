
// B"H
/**
 * @file projector.js
 * @brief Sacred math to map 2D screen coordinates into a 3D world ray.
 * 
 * THE CALCULUS OF THE PIERCING GAZE:
 * The Word travels from the near plane to the far, 
 * piercing through the veil of matrices, near and far!
 * We combine the View and Projection into a single intent,
 * Inverting the matrix to find where the click was sent.
 * From Clip Space to World Space the dual points fly,
 * Drawing a perfect line from the Observer's Eye!
 * 
 * By uniting the View and Projection into a single mathematical vessel (ViewProjection),
 * and finding the inverse of that union, we can take the absolute edges of the user's
 * screen (the Near and Far clip planes) and pull them directly into World Space.
 * This guarantees the Ray is perfectly aligned with the True Camera Origin, regardless
 * of how the mathematical axes are spun or transformed!
 */

import { mat4_core } from '../../math/mat4/core.js';
import { Vec3 } from '../../math/vec3.js';
import { Ray } from './ray.js';

export class RayProjector {
    /**
     * B"H - Unprojects a screen pixel into a flawless mathematical ray.
     * 
     * In the realms of Awtsmoos, the Intent (the click) exists only as a flat 2D shadow.
     * To give it life, we must stretch it across the infinite Z-axis! We extract the exact
     * coordinate on the near plane, and the exact coordinate on the far plane, and the Ray
     * becomes the bridge between them.
     * 
     * @param {number} clientX - The horizontal pixel coordinate from the earthly mouse.
     * @param {number} clientY - The vertical pixel coordinate from the earthly mouse.
     * @param {number} width - The total width of the projection canvas (the Vessel).
     * @param {number} height - The total height of the projection canvas (the Vessel).
     * @param {Float32Array} projMatrix - The pure Projection Matrix (the Lens).
     * @param {Float32Array} viewMatrix - The pure View Matrix (the Position).
     * @returns {Ray} The divine beam of intent, ready to seek vessels.
     */
    static unproject(clientX, clientY, width, height, projMatrix, viewMatrix) {
        // 1. Normalized Device Coordinates (NDC)
        // x goes from -1 (left) to 1 (right)
        // y goes from -1 (bottom) to 1 (top)
        const nx = (clientX / width) * 2.0 - 1.0;
        const ny = 1.0 - (clientY / height) * 2.0;

        // 2. Combine View and Projection
        // The union of Position and Lens creates the absolute matrix of perception.
        const vp = mat4_core.identity();
        mat4_core.multiply(vp, projMatrix, viewMatrix);

        // 3. Invert the View-Projection Matrix
        // We must reverse the Seder Hishtalshelus (Chain of Emanation) to go from Screen back to World!
        const invVP = mat4_core.identity();
        if (!mat4_core.inverse(invVP, vp)) {
            console.error("B\"H - RayProjector: View-Projection Matrix Singularity! The veil cannot be pierced.");
            return new Ray();
        }

        // 4. UNPROJECT TO WORLD SPACE
        // A point on the Near Plane in Clip Space is exactly z = -1.0
        const nearPt = [0, 0, 0];
        mat4_core.transformPoint(nearPt, [nx, ny, -1.0], invVP);

        // A point on the Far Plane in Clip Space is exactly z = 1.0
        const farPt = [0, 0, 0];
        mat4_core.transformPoint(farPt, [nx, ny, 1.0], invVP);

        // 5. NORMALIZE AND CAST
        // The direction is simply the vector pointing from the Near point to the Far point!
        const dir = Vec3.normalize(Vec3.sub(farPt, nearPt));

        // The Near Point rests perfectly upon the camera's lens, acting as the True Origin.
        return new Ray(nearPt, dir);
    }
}
