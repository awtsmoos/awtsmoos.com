
// B"H
/**
 * @file matrixAdaptor.js
 * @brief Harmonizing the disparate inputs of the calling controllers.
 */

import { CameraMatrixExtractor } from './cameraMatrixExtractor.js';

export class MatrixAdaptor {
    /**
     * B"H - Normalizes arg1/arg2 into Column-Major Proj and View matrices.
     */
    static adapt(arg1, arg2) {
        const isMat = (v) => v && (v instanceof Float32Array || Array.isArray(v)) && v.length === 16;

        if (isMat(arg1)) {
            return { proj: arg1, view: arg2 };
        } 

        return CameraMatrixExtractor.getMatrices(arg1);
    }
}
