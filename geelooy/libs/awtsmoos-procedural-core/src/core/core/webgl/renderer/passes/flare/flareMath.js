
// B"H
/**
 * @file flareMath.js
 * @brief Calculations for placing flares along the ray of sight.
 */
import { mat4_core } from '../../../../math/mat4/core.js';

export class FlareMath {
    static getSunScreenPos(projectionMatrix, viewMatrix, lightDir) {
        const sunWorldPos = [lightDir[0] * 1000.0, lightDir[1] * 1000.0, lightDir[2] * 1000.0];
        const viewProj = mat4_core.identity();
        mat4_core.multiply(viewProj, projectionMatrix, viewMatrix);

        const m = viewProj;
        const x = sunWorldPos[0], y = sunWorldPos[1], z = sunWorldPos[2];
        const clipW = m[3] * x + m[7] * y + m[11] * z + m[15];
        
        if (clipW <= 0.0) return [0, 0, 0];

        const clipX = m[0] * x + m[4] * y + m[8] * z + m[12];
        const clipY = m[1] * x + m[5] * y + m[9] * z + m[13];

        return [clipX / clipW * 0.5 + 0.5, clipY / clipW * 0.5 + 0.5, 1.0];
    }
}
