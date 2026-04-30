
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';
import JSONToHTMLCrafter from '../generator/JSONToHTMLCrafter.js';

/**
 * B"H
 * @file PlayerInventoryRenderer.js
 * 
 * Chapter: The Vessels of Gathering.
 * The sparks collected by the player must be organized into Kelim (Vessels).
 * Rather than creating hundreds of divs manually, we define the structure
 * of the inventory conceptually, and the Crafter transforms it into HTML.
 */

/**
 * @class PlayerInventoryRenderer
 * @extends SederHishtalshelusNode
 * @description Crafts the visual layout of the inventory from pure JSON arrays.
 */
export default class PlayerInventoryRenderer extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Beriya_Inventory_Rendering" });
        this.crafter = new JSONToHTMLCrafter();
    }

    /**
     * @method renderInventory
     * @description Takes the raw inventory array and outputs pure, fully styled HTML.
     * @param {Array<Object>} inventoryManifest - The player's items.
     * @returns {string} The HTML string to be injected safely into the DOM.
     */
    renderInventory(inventoryManifest) {
        this.acknowledgeCreator();
        console.log(`B"H - 🎒 Emanating visual structure for Inventory.`);

        const itemSchemas = inventoryManifest.map(item => ({
            tag: 'div',
            attrs: { class: 'inventory-slot', style: 'padding: 10px; border: 2px solid gold; margin: 5px; background: rgba(0,0,0,0.5);' },
            children:[
                { tag: 'h4', content: item.name || 'Unknown Spark', attrs: { style: 'margin:0; color:#fff;' } },
                { tag: 'p', content: item.description || 'A spark of holiness.', attrs: { style: 'font-size: 0.8rem; color:#ccc;' } }
            ]
        }));

        const masterSchema = {
            tag: 'div',
            attrs: { id: 'awtsmoos-inventory-ui', class: 'ui-container', style: 'pointer-events: auto; background: rgba(10,20,40,0.9); border-radius:10px; padding:20px; max-width: 400px; margin: 50px auto;' },
            children:[
                { tag: 'h2', content: 'Sacred Knapsack', attrs: { style: 'color: #00ff00; text-align: center;' } },
                {
                    tag: 'div',
                    attrs: { style: 'display:flex; flex-wrap:wrap; justify-content:center;' },
                    children: itemSchemas.length > 0 ? itemSchemas :[{ tag: 'p', content: 'Your vessels are empty. Seek out the sparks!', attrs: {style: 'color: white;'} }]
                },
                {
                    tag: 'button',
                    content: 'CLOSE',
                    attrs: { onclick: 'document.getElementById("awtsmoos-inventory-ui").remove();', style: 'display:block; margin: 20px auto; padding: 10px 20px; background: red; color: white; border: none; border-radius: 5px; cursor: pointer;' }
                }
            ]
        };

        return this.crafter.craftHTMLString(masterSchema);
    }
}
