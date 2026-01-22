//B"H
// /BH/awtsmoos.com/geelooy/heichelos/post/logic/visuals/observer.js
//B"H
/**
 * @file observer.js
 * The Sentinel of Intersection.
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

    console.log("B\"H - [Observer] Sentinel Awakened.");

    const options = {
        root: scroller,
        threshold: [0, 0.1, 0.5, 1.0] 
    };

    const callback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) visibleNodes.add(entry.target);
            else visibleNodes.delete(entry.target);
        });
        // On any intersection shift, check who is center-most
        performGeometricCheck();
    };

    observer = new IntersectionObserver(callback, options);
    window.postObserver = observer; 

    // Re-check geometry after scroll settles
    scroller.addEventListener('scroll', (e) => {
        // B"H - THE SCROLL GUARD
        // If the scroll event originated inside a comment thread, IGNORE IT.
        if (e.target.closest('.inline-scroll-container')) {
            return;
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            requestAnimationFrame(performGeometricCheck);
        }, 150); // Debounce to prevent rapid firing
    }, { passive: true });
    
    setTimeout(performGeometricCheck, 500);
}

export function performGeometricCheck() {
    if (visibleNodes.size === 0) return;

    let winner = findCenterMostElement(visibleNodes);
    if (!winner) return;

    // B"H - If a whole section won (likely due to comments taking up space),
    // we must find the most relevant sub-section within it to be the true focus.
    if (winner.classList.contains('section') && !winner.classList.contains('sub-awtsmoos')) {
        const innerSubNodes = Array.from(winner.querySelectorAll('.sub-awtsmoos'));
        
        // B"H - THE REFINEMENT OF VISION
        // We only consider sub-sections that are ALSO currently visible to the Sentinel (Observer).
        const visibleInnerSubNodes = innerSubNodes.filter(node => visibleNodes.has(node));

        if (visibleInnerSubNodes.length > 0) {
            // Re-run geometry check on just the *visible* children of the winning section
            // to find which paragraph is spatially closest to the center.
            const subWinner = findCenterMostElement(visibleInnerSubNodes);
            if (subWinner) {
                winner = subWinner; // Promote the sub-section to be the true winner.
            }
        }
        // B"H - If no sub-sections of this section are visible, we stick with the main section as the winner.
        // This is the correct behavior when the text is scrolled completely out of view due to comments.
    }

    const idx = winner.dataset.awtsmoosIdx || winner.dataset.idx;
    const sub = winner.dataset.awtsmoosSub;
    const isSub = winner.classList.contains('sub-awtsmoos');

    if (idx === lastActiveIdx && sub === lastActiveSub) return;

    lastActiveIdx = idx;
    lastActiveSub = sub;

    document.querySelectorAll('.active-reading-section, .active-reading-sub')
        .forEach(n => n.classList.remove('active-reading-section', 'active-reading-sub'));

    if (isSub && idx && sub !== undefined) {
        winner.classList.add('active-reading-sub');
        const parent = winner.closest('.section');
        if (parent) parent.classList.add('active-reading-section');
        
        updateQueryStringParameter("idx", idx);
        updateQueryStringParameter("sub", sub);
        
        window.dispatchEvent(new CustomEvent("awtsmoos index", { 
            detail: { idx: parseInt(idx), sub: parseInt(sub), hunter: true } 
        }));
    } else if (idx) {
        winner.classList.add('active-reading-section');
        updateQueryStringParameter("idx", idx);
        updateQueryStringParameter("sub", null); 
        
        window.dispatchEvent(new CustomEvent("awtsmoos index", { 
            detail: { idx: parseInt(idx), sub: null, hunter: true } 
        }));
    }
}

window.registerObservable = (el) => {
    if (!el) return;
    const tryObserve = () => {
        if (window.postObserver) {
            window.postObserver.observe(el);
            el.querySelectorAll('.sub-awtsmoos').forEach(s => window.postObserver.observe(s));
        } else {
            setTimeout(tryObserve, 100);
        }
    };
    tryObserve();
};
