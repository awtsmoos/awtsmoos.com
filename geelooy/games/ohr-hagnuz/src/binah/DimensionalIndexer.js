
import { MapDirectory } from '../data/MapDirectory.js';

/**
 * B"H
 * @class DimensionalIndexer
 * @chapter The Eye of Understanding
 * @description
 * Scans the blueprints of creation to locate specific landmarks. 
 * By indexing every unique Otiyah in the universe once, we allow 
 * the PortalValidator to find its destination without searching 
 * grid-by-grid at runtime.
 */
export class DimensionalIndexer {
    static _shrine = null;

    /**
     * @description Generates a rapid-lookup library of all unique portal locations.
     */
    static get Library() {
        if (this._shrine) return this._shrine;
        
        console.log("B\"H - DimensionalIndexer: Mapping the Universe...");
        this._shrine = {};

        for (const [mapId, grid] of Object.entries(MapDirectory)) {
            grid.forEach((row, y) => {
                // We split the string carefully, acknowledging that emojis 
                // might be multi-byte, but here we expect single unique chars.
                [...row].forEach((otiya, x) => {
                    // We only index non-base environmental characters.
                    // This ensures we find the UNIQUE portals like '☗' or '🏰'.
                    if (!['1', '2', 'T', 'W', ' ', '.', '~'].includes(otiya)) {
                        this._shrine[otiya] = { mapId, x, y };
                    }
                });
            });
        }
        return this._shrine;
    }

    /**
     * @description Locates the global coordinates of a specific unique character.
     * @param {string} otiya - The Unicode ID to search for.
     * @returns {{mapId: string, x: number, y: number}|null}
     */
    static locate(otiya) {
        return this.Library[otiya] || null;
    }
}
