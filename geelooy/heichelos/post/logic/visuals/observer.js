/**
 * B"H
 * @module SentinelObserver
 * @description
 * Visual observer for legacy/static readers.
 *
 * When the Awtsmoos virtual reader is active, this observer becomes passive.
 * The virtual oracle alone owns active coordinates, URL `idx/sub`, and active
 * subsection state. Without this covenant, two independent geometry systems can
 * fight near verse boundaries and make the stream appear to jump.
 */

import { updateQueryStringParameter } from "../../functions/utils.js";
import { normalizeCommentCoordinate } from "../../comments/state/commentCoordinate.js";
import { emitAwtsmoosEvent } from "../../comments/state/eventBus.js";

let lastActiveIdx = null;
let lastActiveSub = null;
let ticking = false;

function virtualOracleActive() {
    return typeof window !== "undefined" && window.__awtsmoosCurrentVerseIndex !== undefined;
}

function findNearestSubsection(focusY) {
    const subs = document.querySelectorAll(".post-reader-localized-context .sub-awtsmoos");
    let best = null;
    let bestDistance = Infinity;

    for (const sub of subs) {
        const rect = sub.getBoundingClientRect();
        if (rect.height <= 0) continue;
        const inside = focusY >= rect.top && focusY <= rect.bottom;
        const distance = inside ? 0 : Math.min(Math.abs(focusY - rect.top), Math.abs(focusY - rect.bottom));
        if (distance < bestDistance) {
            bestDistance = distance;
            best = sub;
        }
    }
    return best;
}

function chooseActiveReadingVessel() {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const elements = document.elementsFromPoint(x, y);
    let sectionWitness = null;

    for (const el of elements) {
        if (el.classList?.contains("sub-awtsmoos")) return el;
        if (el.classList?.contains("section") && !sectionWitness) sectionWitness = el;
    }

    const nearestSub = findNearestSubsection(y);
    return nearestSub || sectionWitness;
}

export function setupActiveVerseObserver(scroller) {
    if (!scroller) return;
    scroller.addEventListener("scroll", () => {
        if (virtualOracleActive()) return;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                performGeometricCheck();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

export function performGeometricCheck() {
    if (virtualOracleActive()) return;

    const winner = chooseActiveReadingVessel();
    if (!winner) return;

    const idx = winner.dataset.awtsmoosIdx || winner.dataset.idx || winner.closest(".section")?.dataset.awtsmoosIdx || winner.closest(".section")?.dataset.idx;
    const sub = winner.dataset.awtsmoosSub;
    if (idx === lastActiveIdx && sub === lastActiveSub) return;

    lastActiveIdx = idx;
    lastActiveSub = sub;

    const previouslyActive = document.querySelectorAll(".post-reader-localized-context .active-reading-section, .post-reader-localized-context .active-reading-sub");
    for (let i = 0; i < previouslyActive.length; i++) previouslyActive[i].classList.remove("active-reading-section", "active-reading-sub");

    if (winner.classList.contains("sub-awtsmoos") && idx && sub !== undefined) {
        winner.classList.add("active-reading-sub");
        const parentSec = winner.closest(".section");
        if (parentSec) parentSec.classList.add("active-reading-section");
        updateQueryStringParameter("idx", idx);
        updateQueryStringParameter("sub", sub);
        const coordinate = normalizeCommentCoordinate({ idx, sub });
        window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { idx: parseInt(idx), sub: parseInt(sub), hunter: true, coordinate } }));
        emitAwtsmoosEvent("coordinate:changed", { idx: parseInt(idx), sub: parseInt(sub), coordinate });
        return;
    }

    if (idx) {
        winner.classList.add("active-reading-section");
        updateQueryStringParameter("idx", idx);
        updateQueryStringParameter("sub", null);
        const coordinate = normalizeCommentCoordinate({ idx, sub: null });
        window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { idx: parseInt(idx), sub: null, hunter: true, coordinate } }));
        emitAwtsmoosEvent("coordinate:changed", { idx: parseInt(idx), sub: null, coordinate });
    }
}
