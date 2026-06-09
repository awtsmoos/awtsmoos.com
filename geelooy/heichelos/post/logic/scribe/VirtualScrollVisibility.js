// B"H
/**
 * @module VirtualScrollVisibility
 * @description
 * Chapter 271: The Awtsmoos gives the scroll oracle eyes.
 *
 * These helpers read the physical viewport without creating, replacing, or
 * deleting any DOM. They only testify which chunk/subsection is closest to the
 * living reader's gaze.
 */

const asNumber = (value, fallback = 0) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const chunkSelector = id => `#virtual-scroll-container > .scroll-chunk[data-chunk-id="${id}"]`;
export const chunkNode = id => document.querySelector(chunkSelector(id));

function probeY() {
    return Math.min(window.innerHeight * 0.42, window.innerHeight - 120);
}

export function closestVisible(selector) {
    const probe = probeY();
    let winner = null;
    let best = Infinity;
    document.querySelectorAll(selector).forEach(node => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < -760 || rect.top > window.innerHeight + 760) return;
        const distance = rect.top <= probe && rect.bottom >= probe
            ? 0
            : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (distance < best) {
            winner = node;
            best = distance;
        }
    });
    return winner;
}

export function visibleSubsection() {
    return closestVisible(".sub-awtsmoos[data-awtsmoos-idx][data-awtsmoos-sub]");
}

export function visibleChunkId(fallback = 0) {
    const sub = visibleSubsection();
    if (sub) return asNumber(sub.dataset.awtsmoosIdx, fallback);
    const chunk = closestVisible("#virtual-scroll-container > .scroll-chunk[data-chunk-id]");
    return chunk ? asNumber(chunk.dataset.chunkId, fallback) : fallback;
}
