
// B"H
/**
 * @file rayProjector.js
 * @brief NOW SUPPORTS RENDERER FALLBACK FOR TRANSFORMCONTROLLER
 */

import { CoordinateMapper } from '../math/unprojection/ndc/coordinateMapper.js';
import { MatrixAdaptor } from '../math/unprojection/matrices/acquisition/matrixAdaptor.js';
import { RayForgeMaster } from '../math/unprojection/engine/rayForgeMaster.js';

export class RayProjector {
    static unproject(x, y, w, h, arg1, arg2 = null, renderer = null) {
        const isMat = (v) => v && (v instanceof Float32Array || Array.isArray(v)) && v.length === 16;
        const camera = isMat(arg1) ? null : arg1;

        const { proj, view } = MatrixAdaptor.adapt(arg1, arg2);

        if (!proj || !view) {
            console.error(`B"H - RayProjector: Missing critical matrices!`);
            return null;
        }

        const [nx, ny] = CoordinateMapper.screenToNdc(x, y, w, h);

        return RayForgeMaster.forge(nx, ny, proj, view, camera, renderer);
    }
}
