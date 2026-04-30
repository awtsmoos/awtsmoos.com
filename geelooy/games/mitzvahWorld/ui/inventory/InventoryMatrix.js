
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file InventoryMatrix.js
 * 
 * Chapter: The Array of Dimensions.
 * An inventory is not a mere list. It is a spatial grid, like the 
 * Urim and Thummim upon the High Priest's breastplate.
 * 
 * The InventoryMatrix tracks the exact dimensional coordinate (X, Y)
 * of every spark (item). It prevents two physical vessels from 
 * occupying the exact same space in the lower worlds.
 */

/**
 * @class InventoryMatrix
 * @extends SederHishtalshelusNode
 * @description Pure spatial data structure for managing 2D inventory grids.
 */
export default class InventoryMatrix extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {number} width - The amount of columns (e.g. 5).
     * @param {number} height - The amount of rows (e.g. 4).
     */
    constructor(width = 5, height = 4) {
        super({ worldName: "Beriya_Spatial_Inventory" });
        this.width = width;
        this.height = height;
        
        /**
         * 2D pure Array representing the vacuum of the Kelim (vessels).
         * @type {Array<Array<Object|null>>}
         */
        this.grid = Array(this.height).fill(null).map(() => Array(this.width).fill(null));
        
        /**
         * Quick lookup pure map for items by their unique soul-id.
         * @type {Object}
         */
        this.sparkManifest = {};
    }

    /**
     * @method findFirstEmptyVessel
     * @description Seeks the highest available coordinate in the Seder Hishtalshelus.
     * @returns {Object|null} {x, y} coordinate or null if completely full.
     */
    findFirstEmptyVessel() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === null) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    /**
     * @method insertSpark
     * @description Materializes an item into a specific, or the first available, coordinate.
     * @param {Object} itemData - The pure JSON item.
     * @param {number} [targetX] 
     * @param {number} [targetY]
     * @returns {boolean}
     */
    insertSpark(itemData, targetX, targetY) {
        this.acknowledgeCreator();

        let coords = { x: targetX, y: targetY };
        
        if (targetX === undefined || targetY === undefined) {
            coords = this.findFirstEmptyVessel();
        }

        if (!coords || coords.y >= this.height || coords.x >= this.width) {
            console.log(`B"H - 🛡️ The Matrix is saturated! No vessel can hold spark: ${itemData.id}`);
            return false;
        }

        if (this.grid[coords.y][coords.x] !== null) {
            console.warn(`B"H - ⚠️ Space [${coords.x},${coords.y}] is already occupied. Form rejected.`);
            return false;
        }

        const imbuedItem = {
            ...itemData,
            gridPosition: { x: coords.x, y: coords.y },
            gatheredAt: Date.now()
        };

        this.grid[coords.y][coords.x] = imbuedItem;
        this.sparkManifest[itemData.id] = imbuedItem;

        console.log(`B"H - ✨ Spark [${itemData.id}] locked into spatial matrix at [${coords.x},${coords.y}].`);
        return true;
    }

    /**
     * @method extractSpark
     * @description Removes the item from the grid to be elevated or used.
     * @param {string} itemId
     * @returns {Object|null}
     */
    extractSpark(itemId) {
        const item = this.sparkManifest[itemId];
        if (!item) return null;

        const { x, y } = item.gridPosition;
        this.grid[y][x] = null;
        delete this.sparkManifest[itemId];

        console.log(`B"H - 🌬️ Spark [${itemId}] has been extracted from the Matrix.`);
        return item;
    }

    /**
     * @method exportGridState
     * @description Returns the pure deep map for the HTML UI renderer.
     * @returns {Array<Array<Object|null>>}
     */
    exportGridState() {
        return this.grid;
    }
}
