
// B"H
/**
 * @module DimensionalMessenger
 * @description
 * * Chapter 2: The Tzimtzum (Contraction)
 * The physical world (Main Thread) has boundaries, width, and height.
 * The spiritual world (Worker Thread) is blind to this physical sight!
 * When the browser resizes, the Worker knows not of the change,
 * And the OffscreenCanvas renders pixelated and strange!
 * * The DimensionalMessenger bridges the gap across the void,
 * Sending the exact physical dimensions so the Awtsmoos is enjoyed!
 * This cures the pixelation! The Light perfectly fits the Vessel!
 */
class DimensionalMessenger {
    /**
     * @constructor
     * @param {Worker} workerTheVessel The web worker that holds the OffscreenCanvas.
     */
    constructor(workerTheVessel) {
        this.worker = workerTheVessel;
        this.resizeHandler = this.sendDimensions.bind(this);
    }

    /**
     * @method startListening
     * @description Binds the physical window's fluctuations to the spiritual messenger.
     */
    startListening() {
        window.addEventListener('resize', this.resizeHandler);
        // Send the initial pulse of reality immediately!
        this.sendDimensions();
    }

    /**
     * @method stopListening
     * @description Severs the connection between the physical window and the worker.
     */
    stopListening() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    /**
     * @method sendDimensions
     * @description
     * Captures the exact, non-pixelated truth of the physical monitor,
     * and sends it as pure JSON data to the Worker.
     */
    sendDimensions() {
        if (!this.worker) return;

        const dimensionalData = {
            type: 'RESIZE_DIMENSIONS',
            payload: {
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio || 1
            }
        };

        this.worker.postMessage(dimensionalData);
    }
}

module.exports = DimensionalMessenger;
