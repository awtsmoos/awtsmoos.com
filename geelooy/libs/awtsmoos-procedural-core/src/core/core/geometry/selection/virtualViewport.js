
// B"H
/**
 * @file virtualViewport.js
 * @brief The ethereal Window of Tzimtzum, condensing the infinite Light of the Awtsmoos into bounded mathematical numbers!
 * 
 * THE PSALM OF THE BLESSED SAFEGUARDS:
 * Oh Awtsmoos, Source of inorganic clay and spinning metallic discs!
 * You speak existence every millisecond into the voids of memory arrays,
 * Where undefined elements tremble before the Nullness!
 * "Let there be a Target!" The Ten Utterances decree.
 * If the vessel arrives empty (undefined variables), we summon [0, 0, 0] from the primordial Nothing!
 * 
 * Just as You brought forth the heavens and earth from Absolute Emptiness,
 * We must safely parse the Camera State, assuring that even a misaligned script
 * from a parallel Controller doesn't shatter the World Engine into exceptions!
 * 
 * Even the individual digits, X, Y, and Z, are like Aleph-Beis-Nun spelling 'Even' (Rock),
 * Resurrected constantly from your Speech! Let no Exception tear this Seder Hishtalshelus apart!
 */

import { mat4_core } from '../../math/mat4/core.js';
import { mat4_projections } from '../../math/mat4/projections.js';
import { Vec3 } from '../../math/vec3.js';

export class VirtualViewport {
    /**
     * B"H - Calculates the Camera's True World Position from spherical state arrays.
     * Armed with Divine Safeties to ensure the Void is always countered by Truth.
     * 
     * @param {Object} s - The camera definition or spherical state.
     * @returns {Array<number>} The absolute [X,Y,Z] position of the watcher.
     */
    static getCameraWorldPos(s) {
        // Guard against absolute Nothingness. 
        // The default universe is nothing! We supply a default perspective if s is empty.
        if (!s) return [0, 0, 20]; 

        // Safely extract the target, or anchor to the center of reality [0,0,0]
        const tx = (s.target && typeof s.target[0] === 'number') ? s.target[0] : 0;
        const ty = (s.target && typeof s.target[1] === 'number') ? s.target[1] : 0;
        const tz = (s.target && typeof s.target[2] === 'number') ? s.target[2] : 0;

        // Safely extract spherical geometry parameters
        const radius = typeof s.radius === 'number' ? s.radius : 20.0;
        const alpha = typeof s.alpha === 'number' ? s.alpha : 0.0;
        const beta = typeof s.beta === 'number' ? s.beta : 0.0;

        const eyex = tx + radius * Math.cos(beta) * Math.sin(alpha);
        const eyey = ty + radius * Math.sin(beta);
        const eyez = tz + radius * Math.cos(beta) * Math.cos(alpha);
        
        return [eyex, eyey, eyez];
    }

    /**
     * B"H - Constructs a localized VP matrix representing an emulated camera.
     * Converts pure conceptual form into practical WebGL transformation vessels!
     * 
     * @param {Object} camDef - The camera parameters object.
     * @returns {Float32Array} The ViewProjection Matrix ready for rendering math.
     */
    static getVPMatrix(camDef) {
        if (!camDef) camDef = {};
        
        const viewMat = new Float32Array(16);
        const eye = this.getCameraWorldPos(camDef);
        const target = camDef.target || [0, 0, 0];
        const up = camDef.up || [0, 1, 0];
        
        mat4_projections.lookAt(viewMat, eye, target, up);

        const n = camDef.near || 0.1, f = camDef.far || 5000.0;
        
        // B"H - We channel the infinite expanse into a finite bounded box of rendering space.
        const projMat = mat4_projections.perspective(
            camDef.fov || (Math.PI / 3), 
            camDef.aspect || 1.0, 
            n, 
            f
        );

        const vpMat = new Float32Array(16);
        mat4_core.multiply(vpMat, projMat, viewMat);
        return vpMat;
    }

    /**
     * B"H - Casts an emulated ray from the generated VP Matrix into the infinite.
     * Only to be utilized if actual Renderer matrices are completely absent!
     * 
     * @param {number} nx - Normalized X (-1 to 1) mapped from earthly screen boundaries.
     * @param {number} ny - Normalized Y (-1 to 1) mapped from earthly screen boundaries.
     * @param {Object} camDef - The camera state providing the structure.
     * @returns {Object|null} A mathematical Ray containing origin and direction.
     */
    static getRay(nx, ny, camDef) {
        const vpMat = this.getVPMatrix(camDef);
        const invVP = new Float32Array(16);
        
        if (!mat4_core.inverse(invVP, vpMat)) {
            console.error("B\"H - VirtualViewport: Inverse Matrix calculated as a void singularity! The Ray remains unmanifested.");
            return null;
        }

        const eyePos = this.getCameraWorldPos(camDef);
        
        // Unproject a theoretical point resting gently on the far edge of reality
        const farPt = [0, 0, 0];
        mat4_core.transformPoint(farPt, [nx, ny, 1.0], invVP);

        // Normalize it so it becomes pure directed logic, devoid of physical distance scale
        const dir = Vec3.normalize(Vec3.sub(farPt, eyePos));

        return { origin: eyePos, direction: dir };
    }
}
