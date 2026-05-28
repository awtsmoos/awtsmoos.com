/**
 * B"H
 * @module MarginalDOMWeaver
 * @chapter Dissolving and Sweeping the Margins
 * @description
 * Legacy weaver remains for older callers, but cleanup is now stronger: it
 * removes status-only shelters, handles CSS-escaped aliases, and never leaves
 * empty margin shells hanging in the reader.
 */

import { makeInlineComment } from "../../render/core.js";
import { makeInlineCommentHolder } from "../../render/factories/CommentHolderFactory.js";

function cssEscape(value) {
    const str = String(value);
    if (globalThis.CSS && typeof globalThis.CSS.escape === "function") return globalThis.CSS.escape(str);
    return str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function shelterHasRealContent(shelter) {
    return !!shelter?.querySelector?.('.commentator.inline-holder, .inline-comment[data-cid], .awtsmoos-inline-commentary-root[data-cid]');
}

export function weaveInsightIntoMargin(targetVessel, comment, alias) {
    if (!targetVessel || !comment || !comment.id) return;

    let shelter = Array.from(targetVessel.children).find(child => child.classList.contains("marginal-gloss-shelter"));
    if (!shelter) {
        shelter = document.createElement("div");
        shelter.className = "marginal-gloss-shelter";
        shelter.style.setProperty("display", "flex", "important");
        targetVessel.appendChild(shelter);
    }

    let gateway = Array.from(shelter.children).find(child => child.classList.contains("commentator") && child.dataset.alias === alias);
    if (!gateway) {
        gateway = makeInlineCommentHolder(alias, targetVessel, comment.dayuh?.verseSection);
        shelter.appendChild(gateway);
    }

    const listContainer = gateway.querySelector(".comments-holder-inline");
    if (!listContainer) return;
    listContainer.style.setProperty("display", "flex", "important");

    const existing = listContainer.querySelector(`.inline-comment[data-cid="${cssEscape(comment.id)}"], .awtsmoos-inline-commentary-root[data-cid="${cssEscape(comment.id)}"]`);
    if (existing) return;

    const inlineCard = makeInlineComment(comment);
    inlineCard.dataset.fromAlias = alias;
    listContainer.appendChild(inlineCard);
}

export function dissolveMarginalWeave(alias) {
    if (!alias) return;
    const safeAlias = cssEscape(alias);
    const activeGateways = document.querySelectorAll(`.commentator.inline-holder[data-alias="${safeAlias}"], .awtsmoos-inline-shell[data-alias="${safeAlias}"]`);

    activeGateways.forEach(gateway => {
        const shelter = gateway.parentNode;
        gateway.remove();
        if (shelter?.classList?.contains("marginal-gloss-shelter") && !shelterHasRealContent(shelter)) shelter.remove();
    });

    document.querySelectorAll('.marginal-gloss-shelter').forEach(shelter => {
        if (!shelterHasRealContent(shelter)) shelter.remove();
    });
}
