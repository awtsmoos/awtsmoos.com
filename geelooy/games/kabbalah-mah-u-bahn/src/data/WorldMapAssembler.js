
import { SectorKeter } from './Maps/SectorKeter.js';

/**
 * B"H
 * WorldMapAssembler: The Weaver of Physical Coordinates.
 * 
 * Chapter: Translating Intention into Space.
 * The Sefirah of Yesod gathers all the flowing light and directs it into Malchut.
 * Here, we take the pure text matrix of SectorKeter and crystallize it into
 * strict mathematical objects `{ x, y, t, solid, obj, eid }`. 
 * Completely algorithmically pure, completely unhinged in its exactness.
 * 
 * @class WorldMapAssembler
 */
export class WorldMapAssembler {
    static _registry = null;
    
    /**
     * @returns {Array<Object>} The fully manifested grid of physical reality.
     */
    static get WorldRegistry() {
        if (this._registry) return this._registry;
        this._registry = [];
        
        const mapData = SectorKeter;
        const height = mapData.length;
        const width = mapData[0].length;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const char = mapData[y][x];
                
                // Base ground tile
                const node = { 
                    x: x, 
                    y: y, 
                    t: char === '2' ? 'G_T_DET' : 'G_T', 
                    solid: false 
                };
                
                // Physical objects occupying the space
                if (char === 'T') {
                    node.obj = 'TREE_1';
                    node.solid = true;
                } else if (char === 'S') {
                    node.obj = 'NPC_SAGE'; 
                    node.eid = 'ELDER1'; // Ties directly to WisdomStrings
                    node.solid = true;
                }
                
                this._registry.push(node);
            }
        }

        return this._registry;
    }
}
