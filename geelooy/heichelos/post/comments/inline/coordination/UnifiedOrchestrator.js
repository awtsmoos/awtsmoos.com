
/**
 * B"H
 * @module UnifiedOrchestrator
 * @chapter The Harmony of the Spheres
 * @description
 * This conductor ensures that each Guardian's transmissions are gathered 
 * and fixed in the DOM only once per cycle. 
 * It manages the Manifest Lock to prevent double-loading.
 */

import { SparksGatherer } from "/heichelos/post/comments/inline/loading/SparksGatherer.js";
import { SparkFixer } from "/heichelos/post/comments/inline/weaving/SparkFixer.js";
import { getInlineAliases } from "/heichelos/post/comments/state.js";

// B"H - Registry of active manifestation processes
const processingLock = new Set();
const manifestedSet = new Set();

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
        console.trace("B\"H - Tracing Batch Manifestation Source.");

        for (const alias of active) {
            await this.manifestSingle(alias);
        }
        console.groupEnd();
    }

    /**
     * @method manifestSingle
     * @description The ritual for one identity, protected by locks.
     * @param {string} alias 
     */
    static async manifestSingle(alias) {
        if (!alias || processingLock.has(alias) || manifestedSet.has(alias)) {
            if (processingLock.has(alias)) console.log(`B"H - [Orchestrator] @${alias} is already processing.`);
            return;
        }

        const post = window.post;
        if (!post) return;

        try {
            processingLock.add(alias);
            console.log(`%c B"H - [Orchestrator] Beginning manifestation for @${alias}.`, "color: #00ccff;");

            // 1. Gather purified sparks from the data-sphere.
            const sparks = await SparksGatherer.collect(alias, post);

            // 2. Weave them into the physical DOM.
            if (sparks && sparks.length > 0) {
                SparkFixer.fix(sparks, alias);
                manifestedSet.add(alias);
            } else {
                console.log(`B"H - [Orchestrator] No insights found for @${alias}.`);
            }
        } catch (e) {
            console.error(`B"H - [Orchestrator] Manifestation failure for @${alias}:`, e);
        } finally {
            processingLock.delete(alias);
        }
    }

    /**
     * @method resetManifestation
     * @description Clears locks for re-manifestation.
     */
    static resetManifestation(alias) {
        if (alias) {
            manifestedSet.delete(alias);
            processingLock.delete(alias);
        } else {
            manifestedSet.clear();
            processingLock.clear();
        }
    }
}
