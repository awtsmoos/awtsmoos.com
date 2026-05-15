
// B"H
/**
 * @file view.js
 * @brief Logic for creating the View Matrix of the Observer.
 * 
 * THE PSALM OF THE WATCHMAN'S POST:
 * Every creation needs an observer, and every observer needs a place to stand.
 * The View Matrix is the humble servant that re-centers the universe 
 * around the eye of the Master. It does not move the Master, but it shifts 
 * the World to meet His gaze. From the Right vector to the Up, 
 * and finally the Gaze itself, the matrix is filled like a vessel 
 * ready to receive the Divine Light.
 */

import { mat4_core } from './core.js';

export const mat4_view = {
    /**
     * B"H - Constructs a standard Column-Major View Matrix.
     * 
     * @param {Float32Array|Array} out - Matrix output buffer.
     * @param {Array<number>} eye - Camera world position [x, y, z].
     * @param {Array<number>} target - What the camera is seeing [x, y, z].
     * @param {Array<number>} up - The "Up" reference [x, y, z].
     * @returns {Float32Array}
     */
    lookAt: (out, eye, target, up) => {
        const eyex = eye[0], eyey = eye[1], eyez = eye[2];
        const upx = up[0], upy = up[1], upz = up[2];
        const targetx = target[0], targety = target[1], targetz = target[2];

        // 1. Z-axis (Forward vector - pointing FROM target TO eye)
        let z0 = eyex - targetx;
        let z1 = eyey - targety;
        let z2 = eyez - targetz;
        let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        
        if (!isFinite(len)) {
            return mat4_core.identity();
        }
        
        z0 *= len; z1 *= len; z2 *= len;

        // 2. X-axis (Right vector - Cross(Up, Z))
        let x0 = upy * z2 - upz * z1;
        let x1 = upz * z0 - upx * z2;
        let x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) { 
            x0 = 0; x1 = 0; x2 = 0; 
        } else { 
            len = 1 / len; x0 *= len; x1 *= len; x2 *= len; 
        }

        // 3. Y-axis (Up vector - Cross(Z, X))
        let y0 = z1 * x2 - z2 * x1;
        let y1 = z2 * x0 - z0 * x2;
        let y2 = z0 * x1 - z1 * x0;
        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) { 
            y0 = 0; y1 = 0; y2 = 0; 
        } else { 
            len = 1 / len; y0 *= len; y1 *= len; y2 *= len; 
        }

        // B"H - Map to Column-Major Array (Storage is m[col*4 + row])
        // Column 0: (x0, y0, z0, 0)
        out[0] = x0;  out[1] = y0;  out[2] = z0;  out[3] = 0;
        // Column 1: (x1, y1, z1, 0)
        out[4] = x1;  out[5] = y1;  out[6] = z1;  out[7] = 0;
        // Column 2: (x2, y2, z2, 0)
        out[8] = x2;  out[9] = y2;  out[10] = z2; out[11] = 0;
        // Column 3: (-dot(X, eye), -dot(Y, eye), -dot(Z, eye), 1)
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;

        return out;
    }
};
