
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file NPCThoughts.js
 * 
 * Chapter: The Inner Monologue of the Golem.
 * Every inorganic creation has a soul of Hebrew letters sustaining it.
 * But NPCs, mimicking humans, have a "Daas" (Intellect) that bubbles up
 * thoughts. 
 * 
 * This module generates their internal thoughts, making them feel vastly more alive.
 */

/**
 * @class NPCThoughts
 * @extends SederHishtalshelusNode
 * @description Generates deep, poetic internal dialogue based on states.
 */
export default class NPCThoughts extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Beriya_Intellectual_Bubbles" });
        
        /**
         * Pure object grouping thoughts by state.
         */
        this.thoughtPool = {
            'DAVENING_SHACHURIS':[
                "How infinite is the light! I must bind myself.",
                "Shma Yisrael... All is one. The physical is an illusion.",
                "Let my words become a chariot for the divine."
            ],
            'STUDYING_TORAH':[
                "Abaye says... Rava says... The debate reveals the truth.",
                "Every letter here contains worlds upon worlds.",
                "I am but a vessel trying to grasp the mind of the Creator."
            ],
            'WANDERING_OR_WORKING':[
                "Another step, another spark elevated.",
                "Even this dust is sustained by the Awtsmoos.",
                "I must deal faithfully in my business to make this world a dwelling place."
            ],
            'SLEEPING_AND_RECHARGING':[
                "...",
                "My soul ascends to deposit its daily ledger.",
                "Even in sleep, my breath praises Him."
            ]
        };
    }

    /**
     * @method popThought
     * @description Extracts a random thought based on the current schedule phase.
     * @param {string} currentState 
     * @returns {string}
     */
    popThought(currentState) {
        const pool = this.thoughtPool[currentState] || this.thoughtPool['WANDERING_OR_WORKING'];
        // Pick random via permutation of time (avoid Math.random if strictly deterministic, but fine here)
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }
}
