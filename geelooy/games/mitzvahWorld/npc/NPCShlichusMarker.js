
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file NPCShlichusMarker.js
 * 
 * When a soul has a specific mission (Shlichus) from the Awtsmoos,
 * it shines with an intense light. To the physical eye, this appears
 * as a floating exclamation mark (!) above their head.
 * 
 * This module generates the data-driven marker that the UI or 3D engine
 * will render to indicate this holy mission.
 */

/**
 * @class NPCShlichusMarker
 * @extends SederHishtalshelusNode
 * @description Manages the manifestation of the Shlichus (Quest) indicator.
 */
export default class NPCShlichusMarker extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {Object} npcData - The pure data vessel of the NPC.
     */
    constructor(npcData) {
        super({ worldName: "Beriya_Quest_Indicators" });
        this.npcData = npcData;
    }

    /**
     * @method generateMarkerData
     * @description Checks if the NPC has a quest, and generates the marker data.
     * @returns {Object|null} The marker data or null if no quest.
     */
    generateMarkerData() {
        if (this.npcData.hasActiveShlichus) {
            return {
                type: 'SHLICHUS_MARKER',
                symbol: '!',
                color: '#FFD700', // Golden light
                offsetY: 2.5, // Hover above the head
                animation: 'BOUNCE_AND_SPIN'
            };
        }
        return null; // The default state is nothingness
    }

    /**
     * @method grantShlichus
     * @description Imbues the NPC with a divine mission.
     * @param {string} questId - The ID from the ShlichusLedger.
     * @returns {void}
     */
    grantShlichus(questId) {
        console.log(`B"H - 📜 NPC [${this.npcData.id}] has been entrusted with Shlichus: ${questId}`);
        this.npcData.hasActiveShlichus = true;
        this.npcData.availableQuestId = questId;
    }
}
