
// B"H
/**
 * @file instantiate.js
 * @description
 * 🏰 CHAPTER 15: THE ALIGNMENT OF SPARKS (YETZIRAH) 🏰
 * 
 * "A faithful messenger refreshes the soul of his master." 
 * 
 * THE TIKKUN OF THE GHOSTS:
 * We have utterly purged the double-generation logic. The spark is 
 * dispatched, and we rely entirely on the Seder Hishtalshelus (Lifecycle)
 * to draw down the Mesh, apply the coordinates, and THEN solidify it
 * into the physics Octree. Pure order is restored.
 */

import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js';
import Utils from '../../../utils.js';

const instantiate = {
    /**
     * @async
     * @function addObject
     * @description Summons an object and anchors it in the grid of existence.
     */
    async addObject(type, options) {
        const SoulType = AWTSMOOS[type];
        if (!SoulType) return null;

        const nivra = new SoulType(options, this);
        // B"H: silent


        // 1. REGISTRATION
        if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
        
        // 2. LIFECYCLE IGNITION (This handles mesh creation, positioning, and Octree insertion natively!)
        if (nivra.heescheel) await nivra.heescheel(this);

        if (nivra.ready) await nivra.ready();
        if (nivra.afterBriyah) await nivra.afterBriyah();

        return nivra;
    },

    /**
     * @function parseDefinitions
     * @description Interprets the JSON scroll of all beginning sparks.
     */
    parseDefinitions(nivrayim) {
        const list =[];
        if (!nivrayim) return list;

        for (const [type, configs] of Object.entries(nivrayim)) {
            let configArray =[];
            if (Array.isArray(configs)) configArray = configs;
            else if (typeof configs === 'object' && configs !== null) configArray = Object.values(configs);

            configArray.forEach(opt => {
                const evaled = Utils.evalStringifiedFunctions(opt);
                const K = AWTSMOOS[type];
                if (K) {
                    list.push(new K(evaled, this));
                }
            });
        }
        return list;
    }
};

export default instantiate;
