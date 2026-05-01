
/**
 * B"H
 * @module SentinelObserver
 * @description
 * Just as the Creator watches over all paths, the Sentinel watches 
 * the seeker's movement. When the seeker approaches the boundary 
 * of a chunk, this Sentinel commands the Scribe to manifest the 
 * next part of the scroll.
 */

import { findCenterMostElement } from "./geometry.js";
import { updateQueryStringParameter } from "../../functions/utils.js";

let observer = null;
const visibleNodes = new Set();
let lastActiveIdx = null;
let lastActiveSub = null;
let scrollTimeout;

export function setupActiveVerseObserver(scroller) {
    if (!scroller) return;
    if (observer) observer.disconnect();
    visibleNodes.clear();

    const options = { root: scroller, threshold: [0, 0.1, 0.5, 1.0] };

    const callback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleNodes.add(entry.target);
                // B"H - TRIGGER NEIGHBOR RENDERING
                triggerNeighborRendering(entry.target);
            } else {
                visibleNodes.delete(entry.target);
            }
        });
        performGeometricCheck();
    };

    observer = new IntersectionObserver(callback, options);
    window.postObserver = observer; 

    scroller.addEventListener('scroll', (e) => {
        if (e.target.closest('.inline-scroll-container')) return;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => requestAnimationFrame(performGeometricCheck), 150);
    }, { passive: true });
}

/**
 * @private
 * @function triggerNeighborRendering
 */
async function triggerNeighborRendering(element) {
    const section = element.closest('.section');
    if (!section) return;
    
    const idx = parseInt(section.dataset.awtsmoosIdx);
    if (isNaN(idx)) return;

    // Use dynamic import to get chunk render logic to avoid circularity
    const { renderChunk } = await import("../scribe.js");
    const { ScribeScaffold } = await import("../scribe/Scaffold.js");
    
    const currentChunkId = ScribeScaffold.findChunkByItemIndex(idx);
    
    // Manifest next/prev chunks as we get close to edges
    renderChunk(currentChunkId + 1);
    renderChunk(currentChunkId - 1);
}

export function performGeometricCheck() {
    if (visibleNodes.size === 0) return;
    let winner = findCenterMostElement(visibleNodes);
    if (!winner) return;

    if (winner.classList.contains('section') && !winner.classList.contains('sub-awtsmoos')) {
        const visibleSubs = Array.from(winner.querySelectorAll('.sub-awtsmoos')).filter(n => visibleNodes.has(n));
        if (visibleSubs.length > 0) winner = findCenterMostElement(visibleSubs) || winner;
    }

    const idx = winner.dataset.awtsmoosIdx || winner.dataset.idx;
    const sub = winner.dataset.awtsmoosSub;
    if (idx === lastActiveIdx && sub === lastActiveSub) return;

    lastActiveIdx = idx; lastActiveSub = sub;

    document.querySelectorAll('.active-reading-section, .active-reading-sub')
        .forEach(n => n.classList.remove('active-reading-section', 'active-reading-sub'));

    if (winner.classList.contains('sub-awtsmoos') && idx && sub !== undefined) {
        winner.classList.add('active-reading-sub');
        winner.closest('.section')?.classList.add('active-reading-section');
        updateQueryStringParameter("idx", idx); updateQueryStringParameter("sub", sub);
        window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { idx: parseInt(idx), sub: parseInt(sub), hunter: true } }));
    } else if (idx) {
        winner.classList.add('active-reading-section');
        updateQueryStringParameter("idx", idx); updateQueryStringParameter("sub", null); 
        window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { idx: parseInt(idx), sub: null, hunter: true } }));
    }
}

window.registerObservable = (el) => {
    if (!el || !window.postObserver) return;
    window.postObserver.observe(el);
    el.querySelectorAll('.sub-awtsmoos').forEach(s => window.postObserver.observe(s));
};
