/**
 * B"H
 * @module UnifiedOrchestrator
 * @description
 * One eager conductor for inline commentary. When inline aliases are active, all
 * selected aliases are fetched together immediately, then woven into their exact
 * subsection vessels or the verse-end vessel in one pass.
 */

import { SparksGatherer } from "/heichelos/post/comments/inline/loading/SparksGatherer.js";
import { SparkFixer } from "/heichelos/post/comments/inline/weaving/SparkFixer.js";
import { getInlineAliases } from "/heichelos/post/comments/state.js";
import { activateInlineEventCoordinator } from "./InlineEventCoordinator.js";
import { activateAnchorMutationHealer } from "./AnchorMutationHealer.js";

function emptyStats(alias = null, error = null) {
    return { alias, requested: 0, inserted: 0, duplicates: 0, missing: 0, error };
}

function mergeStats(total, next) {
    if (!next) return total;
    total.requested += next.requested || 0;
    total.inserted += next.inserted || 0;
    total.duplicates += next.duplicates || 0;
    total.missing += next.missing || 0;
    if (next.error) total.errors.push(next.error);
    return total;
}

async function gatherAndFix(alias, post) {
    try {
        SparkFixer.showLoading(alias);
        const sparks = await SparksGatherer.collect(alias, post);
        return SparkFixer.fix(sparks || [], alias);
    } catch (error) {
        const message = error?.message || String(error);
        console.error(`B"H - [Orchestrator] Manifestation failure for @${alias}:`, error);
        SparkFixer.showEmpty(alias);
        return emptyStats(alias, message);
    }
}

export class UnifiedOrchestrator {
    static async manifestAllActive() {
        this.activateGuardians();
        const post = window.post;
        const aliases = getInlineAliases();
        const total = { aliases: [...aliases], requested: 0, inserted: 0, duplicates: 0, missing: 0, errors: [] };

        if (!post) {
            const err = "Post context missing; inline comments cannot load yet.";
            console.warn("B\"H - [UnifiedOrchestrator]", err);
            total.errors.push(err);
            return this.remember(total);
        }

        const results = await Promise.all(aliases.map(alias => gatherAndFix(alias, post)));
        results.forEach(result => mergeStats(total, result));
        return this.remember(total);
    }

    static async manifestSingle(alias) {
        if (!alias) return emptyStats(alias);
        this.activateGuardians();
        const post = window.post;
        if (!post) return emptyStats(alias, "Post context missing");
        return this.remember(await gatherAndFix(alias, post));
    }

    static activateGuardians() {
        activateInlineEventCoordinator();
        activateAnchorMutationHealer();
    }

    static remember(stats) {
        if (typeof window !== "undefined") window.__awtsmoosInlineLastManifest = stats;
        return stats;
    }

    static resetManifestation(alias) {
        if (alias) SparksGatherer.clearCacheForAlias(alias, window.post);
        else SparksGatherer.clearAllCache();
    }
}
