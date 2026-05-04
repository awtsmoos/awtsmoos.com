/**
 * B"H
 * 
 * THE PEULA (ACTION) - ACTUALIZATION OF THE WILL
 * 
 * The Peula is the transition from potentiality to actuality.
 * When the mind (player) decides and the body (click) executes,
 * the Peula is the command that ripples through the Sefiros.
 * 
 * It is the "Accepted Interaction."
 * 
 * @module Peula
 */

/**
 * @class Peula
 * @description Translates a physical click into a spiritual action.
 */
export default class Peula {
    constructor(olam) {
        this.olam = olam;
    }

    /**
     * @method execute
     * @description Fires the action on the nivra.
     * @param {Object} intersection - The hit data.
     */
    execute(intersection) {
        const { nivra } = intersection;
        if (!nivra) return;

        // B"H: silent


        // Every Nivra has an ayshPeula (Fire Action) method.
        // It is their way of responding to the world.
        if (typeof nivra.ayshPeula === 'function') {
            nivra.ayshPeula("accepted interaction", this.olam.chossid);
        } else {
            // Fallback for objects that might not have ayshPeula but have logic
            this.handleSpecialCases(nivra);
        }
    }

    /**
     * @method handleSpecialCases
     * @description Handles logic for objects without a standard ayshPeula.
     */
    handleSpecialCases(nivra) {
        // Doors, signs, etc.
        if (nivra.type === 'interactiveDoor') {
            this.olam.ayshPeula("toggle door", nivra);
        }
    }
}
