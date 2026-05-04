
import { SectorKeter } from '../../data/Maps/SectorKeter.js';

/**
 * B"H
 * MapProcessor: The Refiner of Form.
 * 
 * Chapter: From Thought to Action.
 * Before the map can be rendered, it must be understood. This processor 
 * takes the raw strings of Chochmah and organizes them into the 
 * structured vessels of Binah. It assigns solid boundaries where the 
 * letters demand it (like Trees 'T') and attaches conversation IDs 
 * where the Sages 'S' stand.
 * 
 * @class MapProcessor
 */
export class MapProcessor {
    /**
     * Translates a string-based map into an array of tile objects.
     * @param {Array<string>} sourceMap - The raw ASCII grid.
     * @returns {Array<Object>} The processed registry of the world.
     */
    static process(sourceMap) {
        const registry = [];
        const height = sourceMap.length;
        const width = sourceMap[0].length;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const char = sourceMap[y][x];
                registry.push(this.createNode(x, y, char));
            }
        }
        return registry;
    }

    /**
     * B"H
     * Creates a single tile node based on the Otiya (letter) provided.
     * @private
     */
    static createNode(x, y, char) {
        const base = { x, y, solid: false, t: 'G_T' };

        const nodeMaps = {
            '1': () => ({ ...base, t: 'G_T' }),
            '2': () => ({ ...base, t: 'G_T_DET' }),
            'T': () => ({ ...base, t: 'G_T', obj: 'TREE_1', solid: true }),
            'S': () => ({ ...base, t: 'G_T', obj: 'NPC_SAGE', eid: 'ELDER1', solid: true }),
            'default': () => ({ ...base, t: 'G_T' })
        };

        const generator = nodeMaps[char] || nodeMaps['default'];
        return generator();
    }
}
