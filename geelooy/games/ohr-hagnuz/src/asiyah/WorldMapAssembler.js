
import { MapDirectory } from '../data/MapDirectory.js';
import { StateRegistry } from '../binah/StateRegistry.js';
import { PortalLedger } from '../chochmah/PortalLedger.js';

/**
 * B"H
 * @class WorldMapAssembler
 * @chapter The Crystallization of Form
 * @description
 * Every instant, the Speech of the Creator forms the world. 
 * This class takes the raw Otiot and imbues them with physical attributes.
 */
export class WorldMapAssembler {
    static _cache = null;
    static _currentId = null;

    static get WorldRegistry() {
        if (this._cache && this._currentId === StateRegistry.CurrentMapId) {
            return this._cache;
        }
        return this.rebuild();
    }

    /**
     * @description Transforms the current map string array into an object registry.
     */
    static rebuild() {
        this._currentId = StateRegistry.CurrentMapId;
        const grid = MapDirectory[this._currentId];
        if (!grid) return [];

        this._cache = [];
        grid.forEach((row, y) => {
            // We use spread to ensure we handle Unicode characters as whole units
            [...row].forEach((char, x) => {
                const node = { 
                    x, y, char, 
                    t: 'G_T', 
                    solid: false, 
                    isPortal: !!PortalLedger[char] 
                };

                // Property Assignment Mapping (No switches)
                const Solids = { 'T':1, 'W':1, 'M':1, 'w':1, '~':1, '^':1 };
                const Paths = { '2':1, '⇧':1, '⇩':1, '⇪':1, '⇫':1, '⇦':1, '⇨':1, '⬅':1, '➡':1, '⇽':1, '⇾':1, '⇡':1, '⇣':1, '':1, '⇢':1 };
                const Sands = { '.':1 };
                
                if (Solids[char]) node.solid = true;
                if (Paths[char]) node.t = 'G_DIRT_PATH';
                if (Sands[char]) node.t = 'G_SAND';
                if (char === '🌿') node.encounter = true;

                this._cache.push(node);
            });
        });
        return this._cache;
    }
}
