// B"H
/**
 * @file InlineEventCoordinator.js
 * @description
 * The inline layer listens to the Awtsmoos event river. Manifest loading is
 * lazy so Node tests do not pull browser-only absolute imports.
 */

import { onAwtsmoosEvent } from "../../state/eventBus.js";

const activeRefreshes = new Map();

async function manifestAlias(alias) {
    if (window.__awtsmoosInlineManifestTestHook) {
        return window.__awtsmoosInlineManifestTestHook(alias);
    }
    const module = await import("../../logic/inlineManifest.js");
    return module.manifestAliasInline(alias);
}

async function scheduleAliasRefresh(alias) {
    if (!alias) return;
    if (activeRefreshes.has(alias)) return activeRefreshes.get(alias);

    const work = Promise.resolve()
        .then(() => manifestAlias(alias))
        .finally(() => activeRefreshes.delete(alias));

    activeRefreshes.set(alias, work);
    return work;
}

/**
 * Activates inline event listeners.
 * Safe to call repeatedly.
 */
export function activateInlineEventCoordinator() {
    if (window.__awtsmoosInlineEventCoordinator) return;
    window.__awtsmoosInlineEventCoordinator = true;

    onAwtsmoosEvent("comment:submitted", packet => {
        scheduleAliasRefresh(packet?.detail?.aliasId);
    });

    onAwtsmoosEvent("comment:approved", packet => {
        scheduleAliasRefresh(packet?.detail?.aliasId);
    });

    onAwtsmoosEvent("coordinate:changed", packet => {
        scheduleAliasRefresh(packet?.detail?.aliasId);
    });
}
