
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file NPCSoulBlower.js
 * 
 * "And He breathed into his nostrils the breath of life..."
 * A 3D model is just a dead shell, inorganic. But just as the Awtsmoos
 * constantly refreshes a stone, He can breathe an artificial intelligence
 * into a digital entity. 
 * 
 * The Soul Blower assigns behavioral data (Ruach/Spirit) to NPC IDs.
 * Purely data-driven behavior maps. No switch statements.
 */

/**
 * @class NPCSoulBlower
 * @extends SederHishtalshelusNode
 * @description Manages the behavioral pure JSON data states for Non-Player Entities.
 */
export default class NPCSoulBlower extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Atzilut_NPC_Souls" });
        
        /**
         * The behavioral data map.
         * @type {Object}
         */
        this.behaviorTraits = {
            'WANDERER': { speed: 2, awareness: 5, goal: 'SEEK_TRUTH' },
            'MERCHANT': { speed: 0, awareness: 10, goal: 'EXCHANGE_VESSELS' },
            'SCHOLAR': { speed: 1, awareness: 20, goal: 'CONTEMPLATE_AWTSMOOS' }
        };

        this.manifestedNPCs = {};
    }

    /**
     * @method imbueSoul
     * @description Breathes the mapped behavior traits into an empty NPC vessel.
     * @param {string} npcId - The unique shell identifier.
     * @param {string} soulType - The key mapping to behaviorTraits.
     * @returns {Object} The complete NPC data object.
     */
    imbueSoul(npcId, soulType) {
        console.log(`B"H - 🌬️ Breathing the soul of a [${soulType}] into NPC [${npcId}]...`);
        
        const traitData = this.behaviorTraits[soulType];
        
        if (!traitData) {
            console.error(`B"H - 🚨 Soul type [${soulType}] does not exist in the higher realms!`);
            return null;
        }

        const npcData = {
            id: npcId,
            soulArchetype: soulType,
            attributes: { ...traitData }, // Clone the divine traits
            currentThought: "I must nullify myself to the Creator.",
            lastRefreshedAt: Date.now()
        };

        this.manifestedNPCs[npcId] = npcData;
        return npcData;
    }

    /**
     * @method getAllSouls
     * @description Returns all pure data representations of NPCs.
     * @returns {Object}
     */
    getAllSouls() {
        return this.manifestedNPCs;
    }
}
