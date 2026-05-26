
/**
 * B"H
 * @module Orchestrator
 * @chapter The Rhythm of Revelation
 * @description
 * Wisdom requires timing. The Orchestrator waits for the physical 
 * scroll (the Post) to be fully manifested before it begins 
 * the ritual of summoning and placing inline insights.
 * 
 * It coordinates the Transmitter and the PlacementRitual, 
 * ensuring that the Divine Word is followed by its corresponding light.
 */

import { Transmitter } from "./Transmitter.js";
import { PlacementRitual } from "../weaver/PlacementRitual.js";
import { getInlineAliases } from "../../state.js";

export class Orchestrator {
    /**
     * @method manifestAllActive
     * @description
     * The master ritual. It identifies all active identities 
     * and performs the bulk loading and placement for each.
     */
    static async manifestAllActive() {
        const activeGuardians = getInlineAliases();
        const context = window.post;

        if (!context) {
            console.warn("B\"H - [Orchestrator] Waiting for post context...");
            return;
        }


        for (const alias of activeGuardians) {
            const sparks = await Transmitter.summonAllForAlias(alias, context);
            PlacementRitual.execute(sparks, alias);
        }
    }

    /**
     * @method manifestSingle
     * @description Summon and place insights for a single identity.
     * @param {string} alias 
     */
    static async manifestSingle(alias) {
        const context = window.post;
        if (!context || !alias) return;

        const sparks = await Transmitter.summonAllForAlias(alias, context);
        PlacementRitual.execute(sparks, alias);
    }
}
