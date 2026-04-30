
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';
import { ShlichusLedger } from '../../data/quests/ShlichusLedger.js';

/**
 * B"H
 * @file DialogueTreeInterpreter.js
 * 
 * Speech is the vessel of creation. When an NPC speaks, they are 
 * revealing their inner light. This interpreter takes the pure JSON
 * dialogue data of an NPC and builds the HTML structure for it.
 * 
 * It gracefully injects the "!" marker into dialogue options that
 * lead to a Shlichus (Quest), and seamlessly integrates merchant (Buy/Sell) options.
 */

/**
 * @class DialogueTreeInterpreter
 * @extends SederHishtalshelusNode
 * @description Translates NPC thoughts into physical UI vessels (HTML string generation).
 */
export default class DialogueTreeInterpreter extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Yetzirah_Speech_Generation" });
    }

    /**
     * @method generateDialogueHTML
     * @description Creates the intricate UI for speaking with an NPC.
     * @param {Object} npcData - The soul and data of the NPC.
     * @returns {string} The raw HTML string representing the dialogue UI.
     */
    generateDialogueHTML(npcData) {
        this.acknowledgeCreator();

        const name = npcData.name || "Wandering Soul";
        const greeting = npcData.greeting || "Shalom Aleichem! The Awtsmoos sustains us every moment.";
        
        let optionsHTML = '';

        // 1. Shlichus (Quest) Option
        if (npcData.hasActiveShlichus && npcData.availableQuestId) {
            const questInfo = ShlichusLedger[npcData.availableQuestId];
            if (questInfo) {
                optionsHTML += `
                    <button class="dialogue-option quest-option" onclick="acceptShlichus('${npcData.availableQuestId}')">
                        <span class="quest-marker">❗</span> I am ready for a Shlichus: ${questInfo.title}
                    </button>
                `;
            }
        }

        // 2. Merchant (Buy/Sell) Option
        if (npcData.isMerchant) {
            optionsHTML += `
                <button class="dialogue-option merchant-option" onclick="openMerchantTrade('${npcData.id}')">
                    <span class="merchant-marker">🪙</span> Let us exchange vessels (Buy / Sell)
                </button>
            `;
        }

        // 3. General Chat Options
        const standardChats = npcData.chats ||['Tell me about the Awtsmoos.', 'Farewell.'];
        for (let i = 0; i < standardChats.length; i++) {
            optionsHTML += `
                <button class="dialogue-option standard-option" onclick="continueChat(${i})">
                    💬 ${standardChats[i]}
                </button>
            `;
        }

        const finalHTML = `
            <div class="dialogue-box-container awtsmoos-border">
                <div class="dialogue-header">
                    <h3>${name}</h3>
                </div>
                <div class="dialogue-body">
                    <p class="dialogue-text">${greeting}</p>
                </div>
                <div class="dialogue-options-container">
                    ${optionsHTML}
                </div>
            </div>
        `;

        return finalHTML;
    }
}
