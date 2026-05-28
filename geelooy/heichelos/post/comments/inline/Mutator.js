/**
 * B"H
 * @module InlineMutator
 * @chapter Switching the Worlds
 * @description
 * The sidebar switch now returns exact manifestation stats so buttons can reflect
 * truth: loading, shown, empty, hidden, or errored.
 */

import { isAliasInline, getInlineAliases } from "./providers/StateProvider.js";
import { manifestAliasInline } from "./providers/ManifestProvider.js";
import { hideCommentsInline } from "./state.js";
import { dissolveAliasInline } from "../logic/inlineManifest.js";
import { updateQueryStringParameter } from "../../functions/utils.js";

function rememberToggle(result) {
    if (typeof window !== "undefined") window.__awtsmoosInlineLastToggle = result;
    return result;
}

export async function toggleInlineForComments(commentsIgnored, alias) {
    if (!alias) return rememberToggle({ alias, visible: false, error: "Missing alias" });

    const isManifest = isAliasInline(alias);
    const isNowVisible = !isManifest;

    if (isNowVisible) {
        const registry = getInlineAliases();
        if (!registry.includes(alias)) {
            registry.push(alias);
            updateQueryStringParameter("inline", JSON.stringify(registry));
        }

        const stats = await manifestAliasInline(alias);
        return rememberToggle({
            alias,
            visible: true,
            stats,
            inserted: stats?.inserted || 0,
            requested: stats?.requested || 0,
            duplicates: stats?.duplicates || 0,
            missing: stats?.missing || 0,
            empty: (stats?.requested || 0) === 0 || ((stats?.inserted || 0) === 0 && (stats?.duplicates || 0) === 0)
        });
    }

    hideCommentsInline(alias);
    dissolveAliasInline(alias);
    return rememberToggle({ alias, visible: false, hidden: true });
}
