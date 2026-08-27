
// B"H
/**
 * @file cameraMatrixExtractor.js
 * @brief The Seeker of Dimensional Decrees! 
 * 
 * POETRY OF EXTRACTION:
 * From the silent Observer, the Camera Eye,
 * We pull the matrices that define the sky.
 * Whether hidden in functions or properties deep,
 * This module awakes them from their numerical sleep.
 */

export class CameraMatrixExtractor {
    /**
     * B"H - Attempts to find the Projection Matrix within a camera object.
     * @param {Object} camera - The Eye of the beholder.
     * @returns {Float32Array|null} The Projection Decree.
     */
    static getProjection(camera) {
        if (!camera) return null;
        
        // Priority 1: Functions of Truth
        if (typeof camera.getProjectionMatrix === 'function') return camera.getProjectionMatrix();
        if (typeof camera.getProjection === 'function') return camera.getProjection();

        // Priority 2: Properties of Reality
        return camera.projectionMatrix || camera.projMatrix || camera._projectionMatrix;
    }

    /**
     * B"H - Attempts to find the View Matrix within a camera object.
     * @param {Object} camera - The perspective of the soul.
     * @returns {Float32Array|null} The View Perspective.
     */
    static getView(camera) {
        if (!camera) return null;

        // Priority 1: Functions of Insight
        if (typeof camera.getViewMatrix === 'function') return camera.getViewMatrix();
        if (typeof camera.getView === 'function') return camera.getView();

        // Priority 2: Properties of Observation
        return camera.viewMatrix || camera.cameraMatrix || camera._viewMatrix;
    }
}
