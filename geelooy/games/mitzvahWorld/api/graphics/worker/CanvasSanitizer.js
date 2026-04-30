
// B"H
/**
 * @class CanvasSanitizer
 * @description
 * * Chapter 4: The Polishing of the Mirror
 * Deep in the Worker's heart, the canvas is received,
 * but without proper setup, the renderer is deceived!
 * We must apply the resizing logic without delay,
 * To wash the pixelated grime of the world away!
 * * As the speech of the Creator refreshes the stone,
 * we refresh the renderer's size, making the resolution known.
 */
class CanvasSanitizer {
    /**
     * @constructor
     * @param {THREE.WebGLRenderer} renderer - The engine of light.
     * @param {THREE.PerspectiveCamera} camera - The eye of the soul.
     */
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
    }

    /**
     * @method apply
     * @description
     * Updates the internal dimensions of the OffscreenCanvas.
     * Uses 'false' for the third parameter because CSS does not exist here!
     * @param {Object} d - The data containing width, height, and ratio.
     */
    apply(d) {
        console.log(`B"H - 🛠️ Sanitizing Canvas: ${d.width}x${d.height} @ ${d.pixelRatio}`);
        
        if (this.camera) {
            this.camera.aspect = d.width / d.height;
            this.camera.updateProjectionMatrix();
        }

        if (this.renderer) {
            this.renderer.setPixelRatio(d.pixelRatio);
            this.renderer.setSize(d.width, d.height, false);
        }
    }
}

module.exports = CanvasSanitizer;
