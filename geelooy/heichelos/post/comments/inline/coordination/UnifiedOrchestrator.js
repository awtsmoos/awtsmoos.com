/**
 * B"H
 * @module UnifiedOrchestrator
 * @chapter The Harmony of the Spheres
 * @description
 * Single measurable conductor for inline commentary. It now announces loading,
 * empty, and error states, so the user never clicks a silent switch.
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

        for (const alias of aliases) mergeStats(total, await this.manifestSingle(alias));
        return this.remember(total);
    }

    static async manifestSingle(alias) {
        if (!alias) return emptyStats(alias);
        this.activateGuardians();
        const post = window.post;
        if (!post) return emptyStats(alias, "Post context missing");

        try {
            SparkFixer.showLoading(alias);
            const sparks = await SparksGatherer.collect(alias, post);
            const stats = SparkFixer.fix(sparks || [], alias);
            return this.remember(stats);
        } catch (e) {
            const message = e?.message || String(e);
            console.error(`B"H - [Orchestrator] Manifestation failure for @${alias}:`, e);
            const stats = emptyStats(alias, message);
            SparkFixer.showEmpty(alias);
            return this.remember(stats);
        }
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
