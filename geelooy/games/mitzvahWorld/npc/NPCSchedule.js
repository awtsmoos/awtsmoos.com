
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file NPCSchedule.js
 * 
 * Chapter: The Rhythms of Time.
 * Time itself is constantly recreated. "Evening and morning, one day."
 * If the NPCs merely wander randomly, they are beasts (Behemah).
 * To give them human lively spirit (Ruach/Neshamah), they must adhere
 * to a spiritual schedule, completely driven by data and celestial phases.
 */

/**
 * @class NPCSchedule
 * @extends SederHishtalshelusNode
 * @description Maps world-time phases to internal NPC behavioral states.
 */
export default class NPCSchedule extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Yetzirah_Celestial_Clock" });
        
        /**
         * Pure map of Time Ranges (0-24 scale) to behavioral states.
         */
        this.dailyRoutine =[
            { start: 0, end: 6, state: 'SLEEPING_AND_RECHARGING' },
            { start: 6, end: 9, state: 'DAVENING_SHACHURIS' }, // Praying
            { start: 9, end: 14, state: 'WANDERING_OR_WORKING' },
            { start: 14, end: 15, state: 'DAVENING_MINCHA' },
            { start: 15, end: 18, state: 'WANDERING_OR_WORKING' },
            { start: 18, end: 20, state: 'DAVENING_MAARIV' },
            { start: 20, end: 24, state: 'STUDYING_TORAH' }
        ];
    }

    /**
     * @method getCurrentPhase
     * @description Determines what the NPC SHOULD be doing right now based on engine time.
     * @param {number} engineTimeOfDay - Number between 0 and 24.
     * @returns {string} The behavioral state.
     */
    getCurrentPhase(engineTimeOfDay) {
        for (let i = 0; i < this.dailyRoutine.length; i++) {
            const phase = this.dailyRoutine[i];
            if (engineTimeOfDay >= phase.start && engineTimeOfDay < phase.end) {
                return phase.state;
            }
        }
        return 'WANDERING_OR_WORKING'; // Default manifestation
    }
}
