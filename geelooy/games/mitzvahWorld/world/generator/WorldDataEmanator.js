
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';
import TerrainVesselCrafter from './TerrainVesselCrafter.js';

/**
 * B"H
 * @file WorldDataEmanator.js
 * 
 * "Let there be a firmament in the midst of the waters..."
 * The Master Emanator coordinates the 10 statements of creation.
 * It does not build physical meshes itself; rather, it generates
 * the pure JSON data representations of the world. It maps out the 
 * coordinates, the dimensions, and the spiritual roots of every rock
 * and tree before they are manifested visually.
 */

/**
 * @class WorldDataEmanator
 * @extends SederHishtalshelusNode
 * @description Orchestrates the pure-data generation of the entire world.
 */
export default class WorldDataEmanator extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Beriya_World_Emanation" });
        this.terrainCrafter = new TerrainVesselCrafter();
    }

    /**
     * @method generateWorldData
     * @description Utters the speech of creation to return a complete, pure data map.
     * @param {string} worldSeed - The divine seed/root word.
     * @returns {Object} The deeply structured JSON world data.
     */
    generateWorldData(worldSeed = "Bereshis") {
        console.log(`B"H - 🌍 The Awtsmoos speaks the seed [${worldSeed}] into the void...`);
        
        const worldData = {
            metadata: {
                seed: worldSeed,
                timestamp: Date.now(),
                sustainedBy: "The Word of Hashem"
            },
            regions: this.terrainCrafter.craftTerrainData(worldSeed)
        };

        console.log(`B"H - 🌌 World Data successfully emanated from Nothingness.`);
        return worldData;
    }
}
