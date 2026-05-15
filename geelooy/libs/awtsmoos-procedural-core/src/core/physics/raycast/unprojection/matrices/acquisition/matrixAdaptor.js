
// B"H
/**
 * @file matrixAdaptor.js
 * @brief Harmonizing the inputs of reality.
 * 
 * POETRY OF HARMONY:
 * Diverse are the ways the user may call,
 * But the laws of the Matrix apply to them all.
 * We adapt the raw data, we shape every part,
 * To feed the unprojection right from the start.
 */

import { CameraMatrixExtractor } from './cameraMatrixExtractor.js';

export class MatrixAdaptor {
    /**
     * B"H - Normalizes the calling arguments into raw matrices and an optional camera.
     */
    static adapt(arg1, arg2) {
        let proj = null;
        let view = null;
        let camera = null;

        const isMat = (v) => v && (v instanceof Float32Array || Array.isArray(v)) && v.length === 16;

        if (isMat(arg1)) {
            proj = arg1;
            view = arg2;
        } else {
            camera = arg1;
            proj = CameraMatrixExtractor.getProjection(camera);
            view = CameraMatrixExtractor.getView(camera);
        }

        return { proj, view, camera };
    }
}
