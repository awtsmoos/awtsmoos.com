
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file LevelMatrix.js
 * 
 * Chapter: The Foundation of the Earth.
 * "In the beginning... God created the heavens and the earth."
 * To have a playable realm, we must formulate the ground. 
 * The LevelMatrix generates a massive grid of localized dimensions (tiles)
 * that form the physical play area, utilizing mathematical permutations
 * instead of hardcoded chaos.
 */

/**
 * @class LevelMatrix
 * @extends SederHishtalshelusNode
 * @description Manages the pure mathematical representation of the playable terrain.
 */
export default class LevelMatrix extends SederHishtalshelusNode {
    /**
     * @param {number} size - Width and height of the grid.
     * @param {number} tileSize - Visual pixel size of each grid square.
     */
    constructor(size = 100, tileSize = 50) {
        super({ worldName: "Asiyah_Playable_Terrain" });
        this.size = size;
        this.tileSize = tileSize;
        
        /** @type {Array<Array<Object>>} */
        this.grid =[];
        this.emanateTerrain();
    }

    /**
     * @method emanateTerrain
     * @description Populates the grid with structural data.
     * @returns {void}
     */
    emanateTerrain() {
        this.acknowledgeCreator();
        console.log(`B"H - 🌍 Formatting the Firmament into ${this.size}x${this.size} tiles...`);

        for (let y = 0; y < this.size; y++) {
            const row =[];
            for (let x = 0; x < this.size; x++) {
                // Algorithmic pattern generation (Pseudo-noise)
                const val = Math.sin(x * 0.2) + Math.cos(y * 0.2);
                let type = 'GRASS';
                let color = '#155e10';

                if (val > 1.2) {
                    type = 'WATER';
                    color = '#0ea5e9';
                } else if (val < -1) {
                    type = 'DIRT_PATH';
                    color = '#854d0e';
                }

                row.push({
                    x, y, type, color,
                    worldX: x * this.tileSize,
                    worldY: y * this.tileSize
                });
            }
            this.grid.push(row);
        }
    }

    /**
     * @method getGrid
     * @description Exposes the holy matrix.
     * @returns {Array<Array<Object>>}
     */
    getGrid() { return this.grid; }
}
