
// B"H
/**
 * @module WorkerDimensionsReceiver
 * @description
 * * Chapter 3: Receiving the Measurement
 * Deep within the Worker, where the `window` object does not exist,
 * The renderer sits in darkness, hidden in a digital mist!
 * It receives the dimensions from the Main Thread's call,
 * And resizes the Three.js WebGLRenderer to capture it all!
 * * No more pixelation! The jagged edges are smoothed away!
 * The Sefirah of Tiferet (Beauty) shines bright in the day!
 */

class WorkerDimensionsReceiver {
    /**
     * @constructor
     * @param {Object} renderer The Three.js WebGLRenderer instance living in the Worker.
     * @param {Object} camera The Three.js PerspectiveCamera.
     */
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
    }

    /**
     * @method processDimensions
     * @description
     * Applies the pure data payload from the Main thread directly to the renderer.
     * * @param {Object} payload The dimensional data.
     * @param {number} payload.width The exact physical width.
     * @param {number} payload.height The exact physical height.
     * @param {number} payload.pixelRatio The monitor's pixel density.
     */
    processDimensions(payload) {
        if (!payload || !this.renderer) return;

        // 1. Update the Lens of the Observer
        if (this.camera) {
            this.camera.aspect = payload.width / payload.height;
            this.camera.updateProjectionMatrix();
        }

        // 2. Eradicate the Pixelation! 
        // Pass 'false' as the third argument to setSize because OffscreenCanvas has no CSS style object!
        this.renderer.setSize(payload.width, payload.height, false);
        this.renderer.setPixelRatio(payload.pixelRatio);
        
        console.log(`B"H - 🌌 Dimensions Synchronized in Worker! W:${payload.width} H:${payload.height} PR:${payload.pixelRatio}`);
    }
}

module.exports = WorkerDimensionsReceiver;
