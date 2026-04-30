
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file NPCInteractionBrain.js
 * 
 * Chapter: The Meeting of the Worlds.
 * When a player (Tiferet) interacts with an NPC (Netzach/Hod),
 * a specific energetic exchange happens. It might be wisdom (Talking),
 * trading vessels (Inventory/Shop), or accepting a divine mission (Shlichus).
 * 
 * This brain maps the intentions entirely via objects, avoiding rigid logic gates.
 */

/**
 * @class NPCInteractionBrain
 * @extends SederHishtalshelusNode
 * @description Data-driven router for handling player interactions with NPCs.
 */
export default class NPCInteractionBrain extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Atzilut_Divine_Appointments" });
        
        /**
         * Pure map substituting complex switch logic.
         * Resolves the string intent into a behavioral JSON description.
         * @type {Object}
         */
        this.intentResolvers = {
            'STANDARD_CHAT': (npc) => this.resolveChat(npc),
            'SHOP_MERCHANT': (npc) => this.resolveShop(npc),
            'SHLICHUS_QUEST': (npc) => this.resolveShlichus(npc)
        };
    }

    /**
     * @method processInteraction
     * @description Discovers the main archetype of the NPC and routes it.
     * @param {Object} npcData - Pure JSON of the NPC.
     * @returns {Object} A pure JSON schema describing the UI needed.
     */
    processInteraction(npcData) {
        this.acknowledgeCreator();
        
        const primaryIntent = npcData.hasActiveShlichus ? 'SHLICHUS_QUEST' 
                            : (npcData.isMerchant ? 'SHOP_MERCHANT' : 'STANDARD_CHAT');

        const resolver = this.intentResolvers[primaryIntent];
        if (!resolver) {
            console.error(`B"H - 🚨 No spiritual resolution found for intent: ${primaryIntent}`);
            return null;
        }

        console.log(`B"H - 🗣️ Initiating [${primaryIntent}] exchange with NPC: ${npcData.id}`);
        return resolver(npcData);
    }

    /**
     * @method resolveChat
     * @description Maps a simple chat interaction.
     * @param {Object} npc 
     * @returns {Object} JSON UI Schema.
     */
    resolveChat(npc) {
        return {
            uiType: 'DIALOGUE_BOX',
            title: npc.name || 'Wanderer',
            text: npc.greeting || 'Shalom! The Awtsmoos sustains all.',
            options:[
                { text: 'Tell me more about the True Reality.', action: 'DEEP_LORE' },
                { text: 'Farewell.', action: 'CLOSE_UI' }
            ]
        };
    }

    /**
     * @method resolveShop
     * @description Maps a merchant interaction.
     * @param {Object} npc 
     * @returns {Object} JSON UI Schema.
     */
    resolveShop(npc) {
        return {
            uiType: 'MERCHANT_INVENTORY',
            title: `${npc.name}'s Holy Vessels`,
            text: 'I have refined these sparks for exchange. What do you require?',
            inventoryIds: npc.shopItems || ['ITEM_TZITZIT', 'ITEM_APPLE']
        };
    }

    /**
     * @method resolveShlichus
     * @description Maps a quest giver interaction.
     * @param {Object} npc 
     * @returns {Object} JSON UI Schema.
     */
    resolveShlichus(npc) {
        return {
            uiType: 'SHLICHUS_PROMPT',
            title: `Quest from ${npc.name}`,
            text: `I have a holy mission for you. It requires great mesiras nefesh. Will you accept?`,
            questId: npc.availableQuestId,
            options:[
                { text: '❗ I am ready. Give me the Shlichus.', action: `ACCEPT_QUEST:${npc.availableQuestId}` },
                { text: 'I need to prepare my vessels first.', action: 'CLOSE_UI' }
            ]
        };
    }
}
