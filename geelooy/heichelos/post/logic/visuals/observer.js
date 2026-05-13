
/**
 * B"H
 * @module SentinelObserver
 * @chapter O(1) Performance Manifestation
 * @description
 * High-performance tracker that finds the currently focused verse or 
 * paragraph by firing a single ray (elementFromPoint) at the exact 
 * center of the screen, completely avoiding slow bounding-box loops.
 */

import { updateQueryStringParameter } from "../../functions/utils.js";

let lastActiveIdx = null;
let lastActiveSub = null;
let ticking = false;

export function setupActiveVerseObserver(scroller) {
    if (!scroller) return;

    scroller.addEventListener('scroll', (e) => {
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
    // Fire a ray at the exact horizontal and vertical center
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    
    // O(1) hit testing provided directly by the browser engine
    const elements = document.elementsFromPoint(x, y);
    
    let winner = null;
    
    for (const el of elements) {
        if (el.classList.contains('sub-awtsmoos')) {
            winner = el;
            break; // Absolute victory, stop searching
        } else if (el.classList.contains('section') && !winner) {
            winner = el;
        }
    }

    if (!winner) return;

    const idx = winner.dataset.awtsmoosIdx || winner.dataset.idx;
    const sub = winner.dataset.awtsmoosSub;
    
    if (idx === lastActiveIdx && sub === lastActiveSub) return; // No change needed

    lastActiveIdx = idx; 
    lastActiveSub = sub;

    // Fast purge of old active states
    const previouslyActive = document.querySelectorAll('.active-reading-section, .active-reading-sub');
    for(let i=0; i<previouslyActive.length; i++) {
        previouslyActive[i].classList.remove('active-reading-section', 'active-reading-sub');
    }

    // Apply new active states
    if (winner.classList.contains('sub-awtsmoos') && idx && sub !== undefined) {
        winner.classList.add('active-reading-sub');
        const parentSec = winner.closest('.section');
        if (parentSec) parentSec.classList.add('active-reading-section');
        
        updateQueryStringParameter("idx", idx); 
        updateQueryStringParameter("sub", sub);
        window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { idx: parseInt(idx), sub: parseInt(sub), hunter: true } }));
    } else if (idx) {
        winner.classList.add('active-reading-section');
        updateQueryStringParameter("idx", idx); 
        updateQueryStringParameter("sub", null); 
        window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { idx: parseInt(idx), sub: null, hunter: true } }));
    }
}
