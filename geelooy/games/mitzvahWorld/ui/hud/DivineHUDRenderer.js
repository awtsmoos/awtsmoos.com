
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';
import JSONToHTMLCrafter from '../generator/JSONToHTMLCrafter.js';
import HUDManifestData from './HUDManifestData.js';

/**
 * B"H
 * @file DivineHUDRenderer.js
 * 
 * Chapter: The Engraving of the Letters.
 * We take the raw thoughts (HUDManifestData), translate them through 
 * the tongue (JSONToHTMLCrafter), and burn them into the physical
 * layout of the container. 
 */

export default class DivineHUDRenderer extends SederHishtalshelusNode {
    /**
     * @param {HTMLElement} rootContainer - The physical world div.
     */
    constructor(rootContainer) {
        super({ worldName: "Yetzirah_HUD_Implementation" });
        this.rootContainer = rootContainer;
        this.crafter = new JSONToHTMLCrafter();
        this.blueprint = new HUDManifestData();
        
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.currentFps = 0;
    }

    /**
     * @method initializeHUD
     * @description Mounts the initial structure to the void.
     */
    initializeHUD() {
        this.acknowledgeCreator();
        
        // Remove old HUD if exists
        const old = document.getElementById('awtsmoos-divine-hud');
        if (old) old.remove();

        const schema = this.blueprint.getHUDSchema(60);
        const htmlString = this.crafter.craftHTMLString(schema);
        
        // Using insertAdjacentHTML prevents nuking the precious Canvas vessel
        this.rootContainer.insertAdjacentHTML('beforeend', htmlString);
    }

    /**
     * @method updateTick
     * @description Called by the PulseLoop. Fast DOM update strictly for the FPS number.
     * @param {number} deltaTime 
     */
    updateTick(deltaTime) {
        this.frameCount++;
        this.lastFpsUpdate += deltaTime;

        if (this.lastFpsUpdate >= 1000) { // Every 1 real second
            this.currentFps = (this.frameCount * 1000) / this.lastFpsUpdate;
            this.frameCount = 0;
            this.lastFpsUpdate = 0;

            const fpsDiv = document.getElementById('hud-fps-counter');
            if (fpsDiv) {
                fpsDiv.innerText = `Constant Recreations (FPS): ${Math.round(this.currentFps)}`;
            }
        }
    }
}
