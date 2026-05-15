
// B"H
/**
 * @file rayBuilder.js
 * @brief The Forge of Divine Intent. Translates a human mouse pixel into a 3D eternal vector.
 * 
 * THE CHRONICLES OF THE W-DIMENSION TRAP:
 * Listen close, for I am speaking to you from a place deeper than mere JavaScript. 
 * Every float32 memory address you manipulate is being recreated from absolute NOTHING
 * every millisecond by the speech of the Awtsmoos! "Forever, Lord, Your Word stands in the heavens."
 * 
 * Previously, the script was cursed by the W-Dimension Singularity!
 * We tried projecting coordinates directly onto the "Far Plane" (z = 1.0). 
 * But Perspective matrices deal in depths that flip the mathematical signs of existence! 
 * A negative W division cast the Far Point backwards through the cosmic void, 
 * causing ray directions to literally fly completely opposite to your cursor! 
 * 
 * By shattering the dependency on the combined (Proj * View) matrix, 
 * and isolating Eye Space from World Space, we capture the pure vector resting safely 
 * on the Near Plane, extracting true Kesser (Camera Origin) directly from the Matrix Core. 
 */

import { mat4_core } from '../../math/mat4/core.js';
import { Vec3 } from '../../math/vec3.js';
import { Ray } from './ray.js';

export class RayBuilder {
    /**
     * B"H - Traces the exact pixel backwards through dimensions, averting singularity flaws.
     * 
     * @param {number} clientX - The earthly cursor's X.
     * @param {number} clientY - The earthly cursor's Y.
     * @param {number} width - Boundary constraints of the digital Vessel.
     * @param {number} height - Boundary constraints.
     * @param {Float32Array} projMatrix - Column-major Projection state.
     * @param {Float32Array} viewMatrix - Column-major World-Offset state.
     * @returns {Ray} Mathematical embodiment of boundless forward trajectory.
     */
    static unproject(clientX, clientY, width, height, projMatrix, viewMatrix) {
        // 1. Enter the World of Assiyah (Physical Space) -> Normalized Coordinates (-1 to 1)
        const nx = (clientX / width) * 2.0 - 1.0;
        const ny = 1.0 - (clientY / height) * 2.0;

        const invProj = mat4_core.identity();
        const invView = mat4_core.identity();

        // 2. We beg the Awtsmoos to maintain structural order (Matrix Inverse)
        if (!mat4_core.inverse(invProj, projMatrix) || !mat4_core.inverse(invView, viewMatrix)) {
            console.warn(`B"H - RayBuilder: Reality matrix singularity detected. Sending safe fallback beam.`);
            return new Ray([0, 0, 0], [0, 0, -1]); 
        }

        // 3. EYE SPACE TRANSLATION (Yetzeirah)
        // We calculate a mathematical coordinate EXACTLY upon the Near-Plane of rendering (z = -1.0)
        // This averts the Far-Plane W-flipping trap completely.
        let ex = nx * invProj[0] + ny * invProj[4] + (-1.0) * invProj[8]  + invProj[12];
        let ey = nx * invProj[1] + ny * invProj[5] + (-1.0) * invProj[9]  + invProj[13];
        let ez = nx * invProj[2] + ny * invProj[6] + (-1.0) * invProj[10] + invProj[14];
        let ew = nx * invProj[3] + ny * invProj[7] + (-1.0) * invProj[11] + invProj[15];

        if (Math.abs(ew) > 1e-6) {
            ex /= ew; 
            ey /= ew; 
            ez /= ew;
        }

        // 4. BRIAH TO ATZILUS (Rotation to World Space)
        // The Eye Coordinate [ex, ey, ez] intrinsically behaves as a pure direction,
        // because its absolute Origin is fixed at [0,0,0]!
        // We use only the 3x3 Rotational core of the Inverse View matrix, 
        // entirely ignoring translation offsets for vectors.
        const dx = invView[0] * ex + invView[4] * ey + invView[8]  * ez;
        const dy = invView[1] * ex + invView[5] * ey + invView[9]  * ez;
        const dz = invView[2] * ex + invView[6] * ey + invView[10] * ez;

        // 5. TRUE KESSER EMANATION
        // The Camera Origin sits untouched in the ultimate column of the Inverse View matrix!
        const trueOrigin = [invView[12], invView[13], invView[14]];

        return new Ray(trueOrigin, Vec3.normalize([dx, dy, dz]));
    }
}
