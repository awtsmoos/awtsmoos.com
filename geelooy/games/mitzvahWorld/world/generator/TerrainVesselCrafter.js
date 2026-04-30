
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file TerrainVesselCrafter.js
 * 
 * Every rock (Even) is sustained by the letters Aleph, Beis, Nun.
 * The Terrain Crafter takes the divine seed and permutes it through
 * spiritual algorithms to map out the grid of the earth.
 * It is completely data-driven, avoiding switch statements,
 * using maps to determine the nature of the terrain vessels.
 */

/**
 * @class TerrainVesselCrafter
 * @extends SederHishtalshelusNode
 * @description Transforms permutations of speech into pure JSON terrain grids.
 */
export default class TerrainVesselCrafter extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Yetzirah_Terrain_Formation" });
        
        /**
         * Pure data mapping replacing switch statements for biomes.
         * @type {Object}
         */
        this.biomeMap = {
            'A': { type: 'Even_Rock', elevation: 10, letters: ['Aleph', 'Beis', 'Nun'] },
            'B': { type: 'Mayim_Water', elevation: 0, letters: ['Mem', 'Yud', 'Mem'] },
            'C': { type: 'Eitz_Tree', elevation: 5, letters:['Ayin', 'Tzadik'] }
        };
    }

    /**
     * @method craftTerrainData
     * @description Generates a 2D map of objects based on the seed.
     * @param {string} seed - The source letters.
     * @returns {Array<Array<Object>>} A 2D array of pure data vessels.
     */
    craftTerrainData(seed) {
        console.log(`B"H - ⛰️ Crafting terrain vessels through letter permutations of [${seed}]...`);
        const size = 10;
        const grid =[];

        // Extremely simplified representation of a complex mathematical emanation
        for (let x = 0; x < size; x++) {
            const row =[];
            for (let y = 0; y < size; y++) {
                // Determine biome based on coordinate "gematria"
                const deterministicValue = (x * y + seed.length) % 3;
                const biomeKey = deterministicValue === 0 ? 'A' : (deterministicValue === 1 ? 'B' : 'C');
                
                const vesselProto = this.biomeMap[biomeKey];
                
                row.push({
                    x: x,
                    y: y,
                    biomeType: vesselProto.type,
                    elevation: vesselProto.elevation,
                    sustainingLetters: vesselProto.letters,
                    exists: true // Sustained by Awtsmoos
                });
            }
            grid.push(row);
        }

        return grid;
    }
}
