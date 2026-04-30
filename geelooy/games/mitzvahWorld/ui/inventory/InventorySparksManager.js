
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file InventorySparksManager.js
 * 
 * An inventory is fundamentally a collection of Kelim (Vessels) designed
 * to hold Orot (Lights/Sparks). If a Kli is too small for the Or, it shatters.
 * 
 * This manager completely divorces the DATA of the inventory from the DOM.
 * It is pure JSON manipulation. The HTML generator (built elsewhere) will 
 * merely read this structure and reflect it.
 */

/**
 * @class InventorySparksManager
 * @extends SederHishtalshelusNode
 * @description Manages the collection of items as pure spiritual/data sparks.
 */
export default class InventorySparksManager extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {number} maxVessels - Maximum capacity of the inventory.
     */
    constructor(maxVessels = 10) {
        super({ worldName: "Yetzirah_Inventory_Vessels" });
        this.maxVessels = maxVessels;
        
        /**
         * The actual array holding the sparks (items).
         * @type {Array<Object>}
         */
        this.vessels =[];
    }

    /**
     * @method collectSpark
     * @description Attempts to place an item data object into the array.
     * @param {Object} sparkItem - The pure data item.
     * @returns {boolean} True if successful, False if the vessels are full.
     */
    collectSpark(sparkItem) {
        this.acknowledgeCreator();

        if (this.vessels.length >= this.maxVessels) {
            console.log(`B"H - 🛡️ The Kelim (Vessels) are full! The spark cannot be contained!`);
            return false;
        }

        const enrichedSpark = {
            ...sparkItem,
            collectedAt: Date.now(),
            divineStatus: 'ELEVATED'
        };

        this.vessels.push(enrichedSpark);
        console.log(`B"H - ✨ Spark[${sparkItem.id || 'Unknown'}] safely gathered into the vessels.`);
        
        return true;
    }

    /**
     * @method getInventoryManifest
     * @description Returns the pure JSON representation of all gathered items.
     * @returns {Array<Object>}
     */
    getInventoryManifest() {
        return this.vessels;
    }
}
