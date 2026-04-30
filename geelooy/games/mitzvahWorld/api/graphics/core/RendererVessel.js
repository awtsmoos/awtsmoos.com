
// B"H
/**
 * @class RendererVessel
 * @description
 * * Behold the Vessel, the CLI, the mighty WebGL core!
 * A mere tool, nullified, kneeling on the digital floor!
 * It has no power, no light of its own to emit,
 * It only receives what the Awtsmoos decides to transmit!
 * * You complained of pixelation, of a jagged, ugly sight,
 * It is because the physical screen was disconnected from the Light!
 * The devicePixelRatio is the soul's true measure,
 * Syncing the physical monitor with the spiritual treasure!
 * * As the stone is kept alive by the letters Aleph-Beis-Nun (Even),
 * This renderer is sustained by the code sent from Heaven!
 * Every frame, every pixel, recreated from naught,
 * Exactly as the Alter Rebbe in Shaar HaYichud has taught!
 */
const THREE = require('three'); // Or however you import in your bundler
const { getRendererData } = require('../config/rendererData.js');

class RendererVessel {
    /**
     * @constructor
     * @param {Object} options Configuration map for the vessel.
     * @param {HTMLElement} options.container The DOM element to inject the canvas into.
     */
    constructor({ container }) {
        this.container = container;
        this.data = getRendererData();
        this.instance = null;
        
        this.manifest();
    }

    /**
     * @method manifest
     * @description
     * Draws down the configuration from the spiritual blueprint (JSON)
     * into the physical manifestation (THREE.WebGLRenderer).
     * Fixes the pixelation by aligning the pixel ratio to the physical screen!
     * * @returns {void}
     */
    manifest() {
        // Instantiate the vessel with anti-aliasing to smooth the chaotic edges of reality
        this.instance = new THREE.WebGLRenderer(this.data.attributes);
        
        // THE FIX FOR PIXELATION: Unifying the logical and physical pixels!
        this.instance.setPixelRatio(window.devicePixelRatio);
        this.instance.setSize(window.innerWidth, window.innerHeight);
        
        // Configuring shadows and light
        this.instance.shadowMap.enabled = this.data.shadows.enabled;
        this.instance.shadowMap.type = this.data.shadows.type;
        
        // Setting color spaces
        this.instance.outputColorSpace = THREE.SRGBColorSpace; // Assuming newer Three.js version
        this.instance.toneMapping = this.data.toneMapping.type;
        this.instance.toneMappingExposure = this.data.toneMapping.exposure;

        // Attach to the physical world (DOM)
        if (this.container) {
            this.container.appendChild(this.instance.domElement);
        }
        
        this._bindResizingEvents();
    }

    /**
     * @method _bindResizingEvents
     * @private
     * @description
     * Listens to the expanding and contracting of the universe (window resizing).
     * Adjusts the renderer to ensure the Divine Light fills the vessel perfectly.
     */
    _bindResizingEvents() {
        window.addEventListener('resize', () => {
            if (!this.instance) return;
            this.instance.setSize(window.innerWidth, window.innerHeight);
            this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
        });
    }

    /**
     * @method getDOMElement
     * @description Retrieves the actual HTML canvas element.
     * @returns {HTMLCanvasElement} The physical canvas.
     */
    getDOMElement() {
        return this.instance.domElement;
    }

    /**
     * @method render
     * @description 
     * Projects the scene using the camera. A single snapshot of existence,
     * immediately fading back to nothingness unless called again!
     * * @param {THREE.Scene} scene The spiritual landscape.
     * @param {THREE.Camera} camera The eye of the observer.
     */
    render(scene, camera) {
        if (this.instance && scene && camera) {
            this.instance.render(scene, camera);
        }
    }
}

module.exports = RendererVessel;
