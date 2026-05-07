
import { MasterRegistry } from '../../data/PhysicalDictionary/MasterRegistry.js';

/**
 * B"H
 * @file MapProcessor.js
 * @class MapProcessor
 * @chapter The Refiner of Form
 * @description
 * This class takes the raw string arrays of the map and crystallizes them into 
 * actionable node objects. It consults the MasterRegistry for each character 
 * to determine its properties.
 */
export class MapProcessor {
    /**
     * @param {Array<string>} sourceMap 
     * @returns {Array<Object>}
     */
    static process(sourceMap) {
        const registry = [];
        const height = sourceMap.length;
        const width = sourceMap[0].length;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const char = sourceMap[y][x];
                const blueprint = MasterRegistry[char] || MasterRegistry['default'];
                
                registry.push({
                    x, y,
                    char,
                    t: blueprint.t,
                    solid: blueprint.solid || false,
                    obj: blueprint.obj || null,
                    eid: blueprint.eid || null,
                    encounter: blueprint.encounter || false,
                    isEnemy: blueprint.isEnemy || false
                });
            }
        }
        return registry;
    }
}
