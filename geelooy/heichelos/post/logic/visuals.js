//B"H
/**
 * @file visuals.js
 * @description
 * Chapter 19: The intersection observer no longer lets a subsection burn alone.
 * When an inner chamber is active, the outer verse frame is forcibly joined to
 * the light, so the reader always sees the full vessel of the verse.
 */

import { activateOuterVerseForInner } from "/heichelos/post/functions/interaction/ActiveVerseEnvelope.js";

function dispatchIndexFor(entry) {
    const idx = entry.target.dataset.awtsmoosIdx || entry.target.dataset.idx;
    const sub = entry.target.dataset.awtsmoosSub || entry.target.dataset.sub;
    if (idx === undefined) return;
    window.dispatchEvent(new CustomEvent("awtsmoos index", {
        detail: {
            idx: parseInt(idx),
            sub: sub !== undefined ? parseInt(sub) : null,
            awtsmoos: "Awtsmoos",
            time: Date.now()
        }
    }));
}

function markIntersecting(entry, scroller) {
    entry.target.classList.add("active-reading-section");
    if (entry.target.classList.contains("sub-awtsmoos")) activateOuterVerseForInner(entry.target, scroller || document);
    dispatchIndexFor(entry);
}

function unmarkIntersecting(entry) {
    entry.target.classList.remove("active-reading-section");
}

/**
 * Detects which Verse or Paragraph is manifest in the center.
 * @param {Element} scroller Scroll container.
 */
export function setupActiveVerseObserver(scroller) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting ? markIntersecting(entry, scroller) : unmarkIntersecting(entry));
    }, {
        root: scroller,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0.1
    });

    const refreshObservationLoop = () => {
        const nodes = document.querySelectorAll(".section, .sub-awtsmoos");
        if (nodes.length > 0) nodes.forEach(node => observer.observe(node));
        else setTimeout(refreshObservationLoop, 500);
    };
    refreshObservationLoop();
}

/**
 * Animates the physical rollers of the Scroll.
 */
export function setupScrollUnrollEffect() {
    const scrollVessel = document.getElementById("realPost");
    const topRoller = document.querySelector(".scroll-roll-top");
    const bottomRoller = document.querySelector(".scroll-roll-bottom");
    if (!scrollVessel || !topRoller || !bottomRoller) return;

    let frameId;
    const updateRollers = () => {
        const pos = scrollVessel.scrollTop;
        const backgroundOffset = `${pos * 0.5}px`;
        topRoller.style.backgroundPositionY = backgroundOffset;
        bottomRoller.style.backgroundPositionY = backgroundOffset;
    };

    scrollVessel.addEventListener("scroll", () => {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(updateRollers);
    }, { passive: true });

    updateRollers();
    setupActiveVerseObserver(scrollVessel);
}
