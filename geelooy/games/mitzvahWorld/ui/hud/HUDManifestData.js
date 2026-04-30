
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file HUDManifestData.js
 * 
 * Chapter: The Blueprint of the Intellect.
 * A living world must report its status to the observer.
 * This class provides the pure JSON schematic for a Heads-Up Display (HUD)
 * that tracks FPS and Divine Flow Status without touching the physical DOM.
 */

export default class HUDManifestData extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Beriya_HUD_Blueprint" });
    }

    /**
     * @method getHUDSchema
     * @description Pure JSON layout mapping to be interpreted by JSONToHTMLCrafter.
     * @param {number} fps - The current heartbeat rate.
     * @returns {Object}
     */
    getHUDSchema(fps = 0) {
        return {
            tag: 'div',
            attrs: {
                id: 'awtsmoos-divine-hud',
                style: `
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    z-index: 100;
                    background: rgba(0, 0, 0, 0.7);
                    border: 1px solid #00ffff;
                    padding: 10px;
                    border-radius: 8px;
                    color: #00ffff;
                    font-family: 'Courier New', monospace;
                    text-shadow: 0 0 5px #00ffff;
                    pointer-events: none;
                `
            },
            children:[
                {
                    tag: 'h3',
                    content: 'B"H - Realm Manifested',
                    attrs: { style: 'margin: 0 0 5px 0; font-size: 14px;' }
                },
                {
                    tag: 'div',
                    content: `Constant Recreations (FPS): ${Math.round(fps)}`,
                    attrs: { id: 'hud-fps-counter', style: 'font-size: 12px; color: #fff;' }
                },
                {
                    tag: 'div',
                    content: `Status: Receptacles Overflowing`,
                    attrs: { style: 'font-size: 12px; color: #4ade80; margin-top: 2px;' }
                }
            ]
        };
    }
}
