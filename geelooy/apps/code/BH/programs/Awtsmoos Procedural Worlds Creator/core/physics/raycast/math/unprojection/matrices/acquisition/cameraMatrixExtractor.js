
// B"H
/**
 * @file cameraMatrixExtractor.js
 * @brief Digging for gold in the Camera object, and guarding against deceit!
 * 
 * THE PSALM OF THE TRUE VEIL:
 * We discovered a deep illusion in the earthly engine! The View and Projection
 * matrices were swapped in their vessels. The Aspect Ratio was leaking into physical
 * space! This Scribe now mathematically proves which matrix is which by examining
 * the 16th element (Index 15).
 */

export class CameraMatrixExtractor {
    /**
     * B"H - Extracts and verifies both matrices simultaneously.
     * @returns {Object} { proj: Float32Array, view: Float32Array }
     */
    static getMatrices(camera) {
        if (!camera) return { proj: null, view: null };

        let p = null;
        let v = null;

        // 1. Gather raw matrices from the vessel
        if (typeof camera.getProjectionMatrix === 'function') p = camera.getProjectionMatrix();
        else p = camera.projectionMatrix || camera.projection || camera.projMatrix || camera._projectionMatrix;

        if (typeof camera.getViewMatrix === 'function') v = camera.getViewMatrix();
        else v = camera.viewMatrix || camera.view || camera.cameraMatrix || camera._viewMatrix;

        // 2. The Heuristic Verification (The Great Tikkun/Correction)
        // A Perspective Projection matrix ALWAYS has 0.0 at index 15.
        // A standard affine View matrix ALWAYS has 1.0 at index 15.
        if (p && v && p.length === 16 && v.length === 16) {
            const p15 = p[15];
            const v15 = v[15];

            // If P looks like a View (1.0) and V looks like a Proj (0.0)... they are swapped!
            if (Math.abs(p15 - 1.0) < 0.01 && Math.abs(v15) < 0.01) {
                console.warn(`B"H - 🚨 ILLUSION DETECTED: The Camera's Projection and View matrices are swapped! Auto-correcting the vessels...`);
                const temp = p;
                p = v;
                v = temp;
            }
        }

        return { proj: p, view: v };
    }
}
