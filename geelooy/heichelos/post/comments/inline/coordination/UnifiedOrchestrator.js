
/**
 * B"H
 * @module UnifiedOrchestrator
 * @chapter The Harmony of the Spheres
 * @description
 * This conductor ensures that each Guardian's transmissions are gathered 
 * and fixed in the DOM. 
 * We have shattered the false boundary of the 'processingLock'. Since the DOM 
 * constantly breathes and creates new Chunks of verses as you scroll, 
 * the Orchestrator must be free to re-weave the Sparks into any newly 
 * born vessels. The network requests are protected by the SparksGatherer's RAM cache, 
 * and the DOM placements are protected by the SparkFixer's duplication checks.
 */

import { SparksGatherer } from "/heichelos/post/comments/inline/loading/SparksGatherer.js";
import { SparkFixer } from "/heichelos/post/comments/inline/weaving/SparkFixer.js";
import { getInlineAliases } from "/heichelos/post/comments/state.js";

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
        if (!post) {
            console.warn("B\"H - [UnifiedOrchestrator] Post context missing. Aborting batch.");
            return;
        }

        const active = getInlineAliases();
        console.group(`%c B"H - [UnifiedOrchestrator] Batch manifestation for ${active.length} identities.`, "color: #00ff00; font-weight: bold;");

        for (const alias of active) {
            await this.manifestSingle(alias);
        }
        console.groupEnd();
    }

    /**
     * @method manifestSingle
     * @description The ritual for one identity. Perfectly idempotent.
     * @param {string} alias 
     */
    static async manifestSingle(alias) {
        if (!alias) return;
        const post = window.post;
        if (!post) return;

        try {
            // 1. Gather purified sparks from the RAM cache or Network.
            const sparks = await SparksGatherer.collect(alias, post);

            // 2. Weave them into the physical DOM.
            // The SparkFixer automatically skips existing elements, so running this repeatedly is completely safe.
            if (sparks && sparks.length > 0) {
                SparkFixer.fix(sparks, alias);
            }
        } catch (e) {
            console.error(`B"H - [Orchestrator] Manifestation failure for @${alias}:`, e);
        }
    }

    /**
     * @method resetManifestation
     * @description Clears the RAM caches for a fresh start.
     */
    static resetManifestation(alias) {
        if (alias) {
            SparksGatherer.clearCacheForAlias(alias, window.post);
        } else {
            SparksGatherer.clearAllCache();
        }
    }
}
