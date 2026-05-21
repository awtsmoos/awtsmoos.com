// B"H
/**
 * @file AnchorMutationHealer.js
 * @description
 * Chapter 2: when the DOM breathes and old vessels crack, this healer waits
 * one quiet heartbeat, then asks inline aliases to re-manifest without storms.
 */

import { getInlineAliases } from "../../state.js";

let observer = null;
let pending = false;

async function manifestAlias(alias) {
    if (window.__awtsmoosInlineManifestTestHook) {
        return window.__awtsmoosInlineManifestTestHook(alias);
    }
    const module = await import("../../logic/inlineManifest.js");
    return module.manifestAliasInline(alias);
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

/**
 * Starts a tiny mutation healer for a reader root.
 * @param {Element|Document} [root=document] Root to observe.
 * @returns {MutationObserver|null} Active observer.
 */
export function activateAnchorMutationHealer(root = null) {
    const scope = root || (typeof document !== "undefined" ? document : null);
    if (!scope || observer || typeof MutationObserver === "undefined") return observer;
    const target = scope.querySelector?.(".post-reader-localized-context") || scope.body || scope;
    if (!target) return null;

    observer = new MutationObserver(records => {
        if (records.some(record => record.addedNodes.length || record.removedNodes.length)) {
            scheduleHeal();
        }
    });

    observer.observe(target, { childList: true, subtree: true });
    return observer;
}

/**
 * Stops the active mutation healer.
 * @returns {void}
 */
export function deactivateAnchorMutationHealer() {
    observer?.disconnect?.();
    observer = null;
    pending = false;
}
