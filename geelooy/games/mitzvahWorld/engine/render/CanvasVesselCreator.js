
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file CanvasVesselCreator.js
 * 
 * Chapter: The Shaping of the Void.
 * Before the light (rendering) can enter, there must be a defined void (Tzimtzum).
 * The Canvas is the ultimate physical boundary. It is the sheet of parchment
 * upon which the letters of reality are inscribed every frame.
 * 
 * This module ensures the void perfectly matches the browser's bounds,
 * adjusting dynamically if the user stretches the physical dimensions of the universe.
 */

/**
 * @class CanvasVesselCreator
 * @extends SederHishtalshelusNode
 * @description Creates and manages the HTMLCanvasElement, the pure physical vessel for graphics.
 */
export default class CanvasVesselCreator extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {HTMLElement} parentContainer - The DOM element holding the universe.
     */
    constructor(parentContainer) {
        super({ worldName: "Asiyah_Canvas_Manifestation" });
        this.parentContainer = parentContainer;
        this.canvas = null;
        this.context = null;
    }

    /**
     * @method emanateVessel
     * @description Carves out the canvas and appends it to the physical world.
     * @returns {Object} The canvas and its 2D context.
     */
    emanateVessel() {
        this.acknowledgeCreator();

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'awtsmoos-infinite-canvas';
        this.canvas.style.display = 'block';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1';

        // Get the pure 2D light for drawing
        this.context = this.canvas.getContext('2d');

        this.parentContainer.appendChild(this.canvas);
        console.log(`B"H - 🖼️ Canvas vessel successfully embedded into the physical dome.`);

        this.fitToUniverse();
        this.bindCosmicResize();

        return { canvas: this.canvas, ctx: this.context };
    }

    /**
     * @method fitToUniverse
     * @description Measures the bounds of the window and forces the canvas to match exactly.
     */
    fitToUniverse() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * @method bindCosmicResize
     * @description Listens for the browser window changing shape and adjusts the void.
     */
    bindCosmicResize() {
        window.addEventListener('resize', () => {
            console.log(`B"H - 🌌 The physical dimensions shifted. Recalibrating the void...`);
            this.fitToUniverse();
        });
    }
}
