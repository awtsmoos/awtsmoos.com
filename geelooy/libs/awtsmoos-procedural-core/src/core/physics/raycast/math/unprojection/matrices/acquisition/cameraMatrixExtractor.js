
// B"H
/**
 * @file cameraMatrixExtractor.js
 * @brief Digging for gold in the Camera object, cleanly and purely.
 */

export class CameraMatrixExtractor {
    static getMatrices(camera) {
        if (!camera) return { proj: null, view: null };

        let p = camera.projectionMatrix || camera.projection || camera.projMatrix || camera._projectionMatrix;
        let v = camera.viewMatrix || camera.view || camera.cameraMatrix || camera._viewMatrix;

        if (typeof camera.getProjectionMatrix === 'function') p = camera.getProjectionMatrix();
        if (typeof camera.getViewMatrix === 'function') v = camera.getViewMatrix();

        return { proj: p, view: v };
    }
}
