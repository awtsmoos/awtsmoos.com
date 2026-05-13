
import { MapDirectory } from '../data/MapDirectory.js';
import { PortalDictionary } from '../data/maps/PortalDictionary.js';
import { StateRegister } from './StateRegister.js';

/**
 * B"H
 * @class DimensionalIndexer
 * @chapter The Eye of Understanding
 */
export class DimensionalIndexer {
    static _shrine = null;

    static get Library() {
        if (this._shrine) return this._shrine;
        this._shrine = {};
        for (const [mapId, grid] of Object.entries(MapDirectory)) {
            grid.forEach((row, y) => {
                [...row].forEach((otiya, x) => {
                    if (!['1', '2', 'T', 'W', ' ', '.', '~', '^', '✧', '*'].includes(otiya)) {
                        this._shrine[otiya] = { mapId, x, y };
                    }
                });
            });
        }
        return this._shrine;
    }

    /**
     * @description Locates the destination of a portal.
     * Checks explicit PortalDictionary first, then falls back to global unique char search.
     */
    static locate(charScanned) {
        const originMap = StateRegister.CurrentMapId;
        const explicitKey = `${originMap}_${charScanned}`;
        
        // 1. Explicit Routing (For multi-story stairs)
        if (PortalDictionary[explicitKey]) {
            return PortalDictionary[explicitKey];
        }

        // 2. Global Unique Routing (For standard Edge/City portals)
        return this.Library[charScanned] || null;
    }
}
