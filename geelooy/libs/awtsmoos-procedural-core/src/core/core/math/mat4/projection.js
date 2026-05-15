
// B"H
/**
 * @file projection.js
 * @brief Mathematical lenses for the digital world.
 * 
 * THE TRACTATE OF THE LENS:
 * Perspective is the secret of the vanishing point, where all separate
 * dimensions of Creation meet in a single focus. Orthographic is the 
 * view of the Infinite, where distance is a mere illusion and every 
 * vessel retains its absolute scale.
 */

export const mat4_projection = {
    /**
     * B"H - Generates a Perspective Projection Matrix.
     */
    perspective: (fov, aspect, near, far) => {
        const out = new Float32Array(16).fill(0);
        const f = 1.0 / Math.tan(fov * 0.5);
        const invRange = 1.0 / (near - far);
        
        out[0] = f / aspect;
        out[5] = f;
        out[10] = (near + far) * invRange;
        out[11] = -1;
        out[14] = (2 * near * far) * invRange;
        
        return out;
    },

    /**
     * B"H - Generates an Orthographic Projection Matrix.
     */
    ortho: (left, right, bottom, top, near, far) => {
        const out = new Float32Array(16).fill(0);
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        
        out[0] = -2 * lr;
        out[5] = -2 * bt;
        out[10] = 2 * nf;
        out[12] = (left + right) * lr;
        out[13] = (top + bottom) * bt;
        out[14] = (far + near) * nf;
        out[15] = 1;
        
        return out;
    }
};
