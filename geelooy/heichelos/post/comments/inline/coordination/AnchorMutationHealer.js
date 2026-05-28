// B"H
/**
 * @file AnchorMutationHealer.js
 * @description
 * When source text vessels appear later, the inline layer heals once. It must
 * not react to its own marginal cards, summaries, status plaques, or count
 * badges, because those mutations would cause an endless fetch/weave loop.
 */

import { getInlineAliases } from "../../state.js";

let observer = null;
let pending = false;
let healing = false;
let lastHealKey = "";

function currentSearch() {
    return window?.location?.search || globalThis.location?.search || "";
}

function currentCoordinateKey() {
    const params = new URLSearchParams(currentSearch());
    return [params.get("idx") ?? "root", params.get("sub") ?? "main", params.get("inline") ?? "[]"].join("|");
}

function nodeIsInlineChrome(node) {
    if (!node || node.nodeType !== 1) return false;
    return Boolean(node.closest?.(
        ".marginal-gloss-shelter, .awtsmoos-inline-shell, .comments-holder-inline, .awtsmoos-inline-commentary-root"
    ));
}

function recordNeedsHealing(record) {
    const nodes = [...record.addedNodes, ...record.removedNodes];
    if (!nodes.length) return false;
    return nodes.some(node => !nodeIsInlineChrome(node));
}

async function manifestAlias(alias) {
    if (window.__awtsmoosInlineManifestTestHook) return window.__awtsmoosInlineManifestTestHook(alias);
    const { UnifiedOrchestrator } = await import("./UnifiedOrchestrator.js");
    return UnifiedOrchestrator.manifestSingle(alias);
}

async function healActiveAliases() {
    pending = false;
    if (healing) return;
    const key = currentCoordinateKey();
    if (key === lastHealKey) return;

    healing = true;
    lastHealKey = key;
    try {
        const aliases = getInlineAliases();
        for (const alias of aliases) await manifestAlias(alias);
    } finally {
        healing = false;
    }
}

function scheduleHeal() {
    if (pending || healing) return;
    pending = true;
    setTimeout(healActiveAliases, 140);
}

export function activateAnchorMutationHealer(root = null) {
    const scope = root || (typeof document !== "undefined" ? document : null);
    if (!scope || observer || typeof MutationObserver === "undefined") return observer;
    const target = scope.querySelector?.(".post-reader-localized-context") || scope.body || scope;
    if (!target) return null;

    lastHealKey = "";
    observer = new MutationObserver(records => {
        if (records.some(recordNeedsHealing)) scheduleHeal();
    });

    observer.observe(target, { childList: true, subtree: true });
    return observer;
}

export function deactivateAnchorMutationHealer() {
    observer?.disconnect?.();
    observer = null;
    pending = false;
    healing = false;
    lastHealKey = "";
}
