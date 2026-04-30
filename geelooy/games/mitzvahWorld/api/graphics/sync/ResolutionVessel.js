
// B"H
/**
 * @class ResolutionVessel
 * @description
 * * Chapter 2: The Expansion of Space
 * The screen is a vessel, but it must be sized to the Light,
 * To prevent the pixelation that plagues the observer's sight!
 * "Let there be a firmament," and let it be high-res!
 * We sync the dimensions so the Worker can do its best.
 * * This class captures the physical truth of the monitor,
 * and sends it to the Worker, the digital progenitor.
 * Without this sync, the OffscreenCanvas is but a small dot,
 * Stretched until its beauty is entirely forgot!
 */
class ResolutionVessel {
    /**
     * @constructor
     * @param {Worker} worker - The spiritual agent in the background.
     */
    constructor(worker) {
        this.worker = worker;
        this.config = {
            type: 'RESIZE_DIMENSIONS',
            payload: {
                width: 0,
                height: 0,
                pixelRatio: 1
            }
        };
    }

    /**
     * @method broadcast
     * @description Sends the physical dimensions into the Worker's realm.
     */
    broadcast() {
        this.config.payload.width = window.innerWidth;
        this.config.payload.height = window.innerHeight;
        this.config.payload.pixelRatio = window.devicePixelRatio || 1;

        console.log('B"H - 📡 Broadcasting Resolution:', this.config.payload);
        this.worker.postMessage(this.config);
    }

    /**
     * @method monitor
     * @description Hooks into the world's resizing to maintain clarity.
     */
    monitor() {
        window.addEventListener('resize', () => this.broadcast());
        this.broadcast(); // Initial burst of light!
    }
}

module.exports = ResolutionVessel;
