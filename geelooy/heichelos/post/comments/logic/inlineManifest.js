/**
 * B"H
 * @module InlineManifestConductor
 * @chapter One Gate for Every Margin
 * @description
 * Legacy callers still import this file, so this conductor now delegates to the
 * same UnifiedOrchestrator used by the sidebar toggle. No split inline paths.
 */

import { UnifiedOrchestrator } from "../inline/coordination/UnifiedOrchestrator.js";
import { dissolveMarginalWeave } from "./inlineManifest/MarginalDOMWeaver.js";
import { getInlineAliases } from "../state.js";

export async function manifestAliasInline(alias) {
    return UnifiedOrchestrator.manifestSingle(alias);
}

export async function manifestAllActiveInlines() {
    const total = { aliases: getInlineAliases(), requested: 0, inserted: 0, duplicates: 0, missing: 0, errors: [] };
    for (const alias of total.aliases) {
        const stats = await UnifiedOrchestrator.manifestSingle(alias);
        total.requested += stats?.requested || 0;
        total.inserted += stats?.inserted || 0;
        total.duplicates += stats?.duplicates || 0;
        total.missing += stats?.missing || 0;
        if (stats?.error) total.errors.push(stats.error);
    }
    if (typeof window !== "undefined") window.__awtsmoosInlineLegacyManifest = total;
    return total;
}

export function dissolveAliasInline(alias) {
    dissolveMarginalWeave(alias);
}
