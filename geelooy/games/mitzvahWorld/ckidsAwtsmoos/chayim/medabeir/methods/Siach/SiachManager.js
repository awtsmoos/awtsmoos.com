/**
 * B"H
 * 
 * THE SIACH (DIALOGUE) MANAGER - THE HOLY SPEECH
 * 
 * "With ten statements the world was created."
 * Speech is not merely the transmission of data; it is the act of creation itself.
 * When an NPC speaks, they are manifesting a specific reality for the player.
 * 
 * This manager, Siach, orchestrates the flow of these statements.
 * It handles branching paths, conditions, and the ultimate unification
 * of the player's choice with the world's response.
 * 
 * @module Siach
 */

import { DialogueUI } from "./DialogueUI.js";

/**
 * @class SiachManager
 * @description Manages the lifecycle of a conversation.
 */
export default class SiachManager {
    /**
     * @constructor
     * @param {Object} nivra - The Nivra (NPC) who is speaking.
     * @param {Object} olam - The Olam context.
     */
    constructor(nivra, olam) {
        this.nivra = nivra;
        this.olam = olam;

        /**
         * @property {Object|null} activeConversation
         * @description The current state of the conversation.
         */
        this.activeConversation = null;
    }

    /**
     * @method begin
     * @description Starts a new conversation with the Chossid.
     * @param {Object} chossid - The player character.
     */
    begin(chossid) {
        const tree = this.nivra.messageTree;
        if (!tree || tree.length === 0) return;

        this.activeConversation = {
            chossid: chossid,
            currentNodeIndex: 0,
            startTime: Date.now()
        };

        this.olam.ayshPeula("dialogueStarted", {
            npc: this.nivra,
            chossid: chossid
        });

        this.render();
    }

    /**
     * @method choose
     * @description Processes a player's choice.
     * @param {number} index - The index of the selected response.
     */
    choose(index) {
        if (!this.activeConversation) return;

        const node = this.getCurrentNode();
        const response = node.responses[index];

        if (!response) return;

        // Execute actions (Missions, item giving, etc.)
        if (typeof response.action === 'function') {
            response.action(this.nivra, this.activeConversation.chossid);
        } else if (typeof response.action === 'string') {
            this.handleStringAction(response.action, response, this.activeConversation.chossid);
        }

        if (response.nextMessageIndex !== undefined || response.next !== undefined) {
            this.activeConversation.currentNodeIndex = response.nextMessageIndex !== undefined ? response.nextMessageIndex : response.next;
            this.render();
        } else if (response.close || response.type === "close") {
            this.end();
        }
    }

    /**
     * B"H: Handle string-based actions by delegating to the character or system.
     */
    handleStringAction(actionName, response, chossid) {
        if (!chossid) return;

        if (actionName === "studyPasuk" && response.pasukId) {
            const result = chossid.studyManager.study(response.pasukId);
            this.olam.ayshPeula("ui event", "toast", { 
                message: result.message,
                type: result.success ? "success" : "warning"
            });
        }
        
        // Handle other string actions (openShop, acceptMission, etc.)
        if (actionName === "openShop") {
            this.nivra.handleDialogue(chossid); // Re-triggers with shop logic if applicable
        }

        if (actionName === "acceptMission" && response.missionId) {
            if (chossid.shlichusBook) {
                chossid.shlichusBook.acceptMission(response.missionId);
            }
        }
    }

    /**
     * @method getCurrentNode
     * @returns {Object}
     */
    getCurrentNode() {
        const tree = this.nivra.messageTree;
        return tree[this.activeConversation.currentNodeIndex];
    }

    /**
     * @method render
     * @description Manifests the dialogue UI.
     */
    render() {
        const node = this.getCurrentNode();
        if (!node) return;

        // B"H: We generate the premium UI structure.
        const uiData = DialogueUI.generate({
            npcName: this.nivra.name || "A Messenger",
            message: node.message,
            responses: node.responses,
            onChoice: (index) => this.choose(index)
        });

        // Fire the UI manifestation into the Olam.
        // The Olam's UI system will handle the actual DOM injection.
        this.olam.htmlAction(uiData);
    }

    /**
     * @method end
     * @description Concludes the holy speech.
     */
    end() {
        if (this.activeConversation) {
            this.olam.ayshPeula("dialogueEnded", this.nivra);
            this.activeConversation = null;
        }
        
        this.olam.htmlAction({
            shaym: "dialogue-vessel",
            methods: { classList: { add: "hidden" } }
        });
    }
}
