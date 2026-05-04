
/**
 * B"H
 * @module UnifiedOrchestrator
 * @chapter The One and the Many
 * @description
 * Fragmentation leads to redundancy (double loading).
 * This Orchestrator maintains a "Lock of Manifestation" to ensure 
 * that each Guardian's transmissions are gathered and woven 
 * only once in a single unified flow.
 * 
 * Added Stack-Trace-Sigils to identify who is triggering the load multiple times.
 */

import { SparksGatherer } from "../loading/SparksGatherer.js";
import { SparkFixer } from "../weaving/SparkFixer.js";
import { getInlineAliases } from "../../state.js";

// B"H - The Registry of Manifested Light
const manifestLock = new Set();
const processingLock = new Set();

/**
 * @class UnifiedOrchestrator
 */
export class UnifiedOrchestrator {
    /**
     * @method manifestAllActive
     * @description Gather and fix all insights for every Guardian currently enabled.
     */
    static async manifestAllActive() {
        const post = window.post;
        if (!post) return;

        const activeGuardians = getInlineAliases();
        
        console.group(`%c B"H - [UnifiedOrchestrator] Orchestrating manifestation for ${activeGuardians.length} guardians.`, "color: #00ff00; font-weight: bold;");
        console.trace("B\"H - Tracing the Orchestrator Trigger.");

        for (const alias of activeGuardians) {
            await this.manifestSingle(alias);
        }
        console.groupEnd();
    }

    /**
     * @method manifestSingle
     * @description The complete ritual for one Guardian. Guarded by locks.
     * @param {string} alias 
     */
    static async manifestSingle(alias) {
        if (!alias || processingLock.has(alias) || manifestLock.has(alias)) {
            if (processingLock.has(alias)) console.log(`B"H - @${alias} is already in the midst of manifestation. Skipping redundant call.`);
            return;
        }

        const post = window.post;
        if (!post) return;

        try {
            // 1. Secure the Lock.
            processingLock.add(alias);
            console.log(`%c B"H - [UnifiedOrchestrator] Beginning ritual for @${alias}.`, "color: #00ccff;");

            // 2. Gather the sparks from the API.
            const sparks = await SparksGatherer.collect(alias, post);

            // 3. Fix the sparks into the physical DOM.
            if (sparks && sparks.length > 0) {
                SparkFixer.fix(sparks, alias);
                manifestLock.add(alias); // Successfully manifested.
            } else {
                console.log(`B"H - No insights found for @${alias} to manifest.`);
            }

        } catch (e) {
            console.error(`B"H - [UnifiedOrchestrator] Manifestation rupture for @${alias}:`, e);
        } finally {
            // 4. Release the Processing Lock.
            processingLock.delete(alias);
        }
    }

    /**
     * @method resetManifestation
     * @description Allows re-triggering if the state changes (e.g. deselected then re-selected).
     */
    static resetManifestation(alias) {
        manifestLock.delete(alias);
        processingLock.delete(alias);
    }
}
