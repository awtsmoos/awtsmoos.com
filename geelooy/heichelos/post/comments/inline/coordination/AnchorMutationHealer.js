// B"H
/**
 * @file AnchorMutationHealer.js
 * @description
 * When the DOM breathes and new reading vessels appear, re-run the same unified
 * inline orchestrator used by the sidebar toggle. No old manifest path remains.
 */

import { getInlineAliases } from "../../state.js";

let observer = null;
let pending = false;

async function manifestAlias(alias) {
    if (window.__awtsmoosInlineManifestTestHook) return window.__awtsmoosInlineManifestTestHook(alias);
    const { UnifiedOrchestrator } = await import("./UnifiedOrchestrator.js");
    return UnifiedOrchestrator.manifestSingle(alias);
}

async function healActiveAliases() {
    pending = false;
    const aliases = getInlineAliases();
    for (const alias of aliases) await manifestAlias(alias);
}

function scheduleHeal() {
    if (pending) return;
    pending = true;
    setTimeout(healActiveAliases, 90);
}

export function activateAnchorMutationHealer(root = null) {
    const scope = root || (typeof document !== "undefined" ? document : null);
    if (!scope || observer || typeof MutationObserver === "undefined") return observer;
    const target = scope.querySelector?.(".post-reader-localized-context") || scope.body || scope;
    if (!target) return null;

    observer = new MutationObserver(records => {
        if (records.some(record => record.addedNodes.length || record.removedNodes.length)) scheduleHeal();
    });

    observer.observe(target, { childList: true, subtree: true });
    return observer;
}

export function deactivateAnchorMutationHealer() {
    observer?.disconnect?.();
    observer = null;
    pending = false;
}
