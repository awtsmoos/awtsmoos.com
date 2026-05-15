
// B"H
/**
 * @file skyMath.js
 * @brief Holy calculations for extracting pure viewing rays.
 */
import { mat4_core } from '../../../../math/mat4/core.js';

export class SkyMath {
    /**
     * B"H - Returns the pure Inverse Projection and Inverse View matrices
     * to reconstruct an undistorted ray from the camera lens.
     */
    static getInverseMatrices(projectionMatrix, viewMatrix) {
        let invProj = mat4_core.identity();
        let invView = mat4_core.identity();
        
        mat4_core.inverse(invProj, projectionMatrix);
        
        // Remove translation from view matrix before inverting to keep sky infinite
        const rotView =[...viewMatrix];
        rotView[12] = 0; rotView[13] = 0; rotView[14] = 0;
        mat4_core.inverse(invView, rotView);
        
        return { invProj, invView };
    }
}
