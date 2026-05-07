
import { MapDirectory } from './maps/MapDirectory.js';
import { StateRegister } from '../binah/StateRegister.js';
import { MasterRegistry } from './PhysicalDictionary/MasterRegistry.js';
import { StringEmanation } from '../utils/StringEmanation.js';

/**
 * B"H
 * @class WorldMapAssembler
 * @chapter The Crystallization of Form
 * @description
 * Scans the raw Otiot (letters) of the Seder Map and binds them to physical properties 
 * derived purely from the MasterRegistry. 
 */
export class WorldMapAssembler {
    static _cache = null;
    static _currentId = null;

    static get WorldRegistry() {
        if (this._cache && this._currentId === StateRegister.CurrentMapId) {
            return this._cache;
        }
        return this.rebuild();
    }

    static rebuild() {
        this._currentId = StateRegister.CurrentMapId;
        const grid = MapDirectory[this._currentId];
        if (!grid) return [];

        this._cache = [];
        grid.forEach((row, y) => {
            const characters = StringEmanation.split(row);
            
            characters.forEach((char, x) => {
                const blueprint = MasterRegistry[char] || MasterRegistry['default'];
                
                const node = { 
                    x, y, char, 
                    t: blueprint.t || 'G_T', 
                    solid: blueprint.solid || false,
                    isPortal: blueprint.isPortal || false,
                    encounter: blueprint.encounter || false,
                    eid: blueprint.eid || null, 
                    isSoul: !!blueprint.eid,
                    isEnemy: blueprint.isEnemy || false,
                    dir: blueprint.dir || 'd',
                    color: blueprint.color || '#fff'
                };

                this._cache.push(node);
            });
        });
        return this._cache;
    }
}
