// B"H
/**
 * @module VirtualScrollOracle
 * @description
 * Chapter 141: The oracle remembers the exact chamber, not merely the verse.
 * It listens to the viewport, awakens neighboring chunks, and restores refresh
 * position to idx/sub aliases after layout has settled.
 */

import { chunkWindow, chunksToPrune, parseScrollTarget } from "./VirtualScrollMath.js";

export { chunkWindow, chunksToPrune, parseScrollTarget };

let activeObserver = null;
let activeRenderer = null;
let activePruner = null;
let activeTotalChunks = 0;
let activeScrollHandler = null;
const revealed = new Set();

function revealChunk(chunkId) {
    if (!activeRenderer || revealed.has(chunkId)) return Promise.resolve();
    revealed.add(chunkId);
    return activeRenderer(chunkId);
}

function pruneAround(center) {
    if (!activePruner) return;
    chunksToPrune(revealed, center).forEach(id => {
        activePruner(id);
        revealed.delete(id);
    });
}

function revealWindow(center) {
    chunkWindow(center, activeTotalChunks).forEach(revealChunk);
    pruneAround(center);
}

function nearestChunkFromViewport() {
    const chunks = [...document.querySelectorAll(".scroll-chunk[data-chunk-id]")];
    let best = { id: 0, distance: Number.POSITIVE_INFINITY };
    chunks.forEach(chunk => {
        const rect = chunk.getBoundingClientRect();
        const distance = Math.abs(rect.top - window.innerHeight * 0.38);
        const id = Number.parseInt(chunk.dataset.chunkId || "0", 10);
        if (distance < best.distance) best = { id, distance };
    });
    return best.id;
}

function attachScrollFallback() {
    let raf = 0;
    activeScrollHandler = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            revealWindow(nearestChunkFromViewport());
        });
    };
    window.addEventListener("scroll", activeScrollHandler, { passive: true });
    activeScrollHandler();
}

function firstParam(params, names) {
    for (const name of names) {
        const value = params.get(name);
        if (value !== null && value !== undefined && value !== "") return value;
    }
    return null;
}

function targetFromQuery(query) {
    const params = query instanceof URLSearchParams ? query : new URLSearchParams(String(query || ""));
    const mathTarget = parseScrollTarget(params);
    const idx = firstParam(params, ["idx", "verse", "verseIndex", "section", "sectionIndex"]);
    const sub = firstParam(params, ["sub", "subsection", "subSection", "subIdx", "paragraph", "para"]);
    return {
        idx: idx === null ? mathTarget.idx : Number.parseInt(idx, 10),
        sub: sub === null || sub === "" || sub === "null" || sub === "root" ? mathTarget.sub : Number.parseInt(sub, 10)
    };
}

function exactTarget(idx, sub) {
    const section = document.querySelector(`[data-awtsmoos-idx="${idx}"].section, .section[data-idx="${idx}"], .section[data-awtsmoos-idx="${idx}"]`);
    if (!section) return null;
    if (sub !== null && Number.isFinite(sub)) {
        return section.querySelector(`.sub-awtsmoos[data-awtsmoos-sub="${sub}"], .sub-awtsmoos[data-sub="${sub}"], .sub-awtsmoos[data-sub-section="${sub}"]`) || section;
    }
    return section;
}

function topOffset() {
    const header = document.querySelector(".awtsmoos-integrated-header")?.getBoundingClientRect().height || 0;
    return Math.max(18, header) + 18;
}

function scrollToTarget(target, behavior = "auto") {
    const y = target.getBoundingClientRect().top + window.pageYOffset - topOffset();
    window.scrollTo({ top: Math.max(0, y), behavior });
}

/** Starts dynamic chunk revelation for the current scroll. */
export function awakenVirtualScrollOracle({ totalChunks, renderChunk, unrenderChunk, root = null } = {}) {
    resetVirtualScrollOracle();
    activeRenderer = renderChunk;
    activePruner = unrenderChunk;
    activeTotalChunks = Math.max(0, Number(totalChunks) || 0);
    const chunks = [...document.querySelectorAll(".scroll-chunk[data-chunk-id]")];
    if (!chunks.length || !activeRenderer) return;

    if (typeof IntersectionObserver !== "function") {
        attachScrollFallback();
        return;
    }

    activeObserver = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach(entry => {
            const id = Number.parseInt(entry.target.dataset.chunkId || "0", 10);
            revealWindow(id);
        });
    }, { root, rootMargin: "900px 0px 900px 0px", threshold: 0.01 });

    chunks.forEach(chunk => activeObserver.observe(chunk));
}

/**
 * Scrolls back to the URL target after its chunk has a body.
 * @param {string|URLSearchParams} query Search string or params.
 * @param {(chunkId:number)=>Promise<void>} renderChunk Renderer.
 * @param {number} chunkSize Items per chunk.
 * @returns {Promise<Element|null>} Target element if found.
 */
export async function restoreScrollTarget(query, renderChunk, chunkSize) {
    const { idx, sub } = targetFromQuery(query);
    if (!Number.isFinite(idx)) return null;
    const chunkId = Math.floor(idx / chunkSize);
    await renderChunk(chunkId);
    await renderChunk(chunkId + 1);
    if (chunkId > 0) await renderChunk(chunkId - 1);

    const target = exactTarget(idx, sub);
    if (!target) return null;
    target.classList.add("awtsmoos-refresh-target");
    requestAnimationFrame(() => requestAnimationFrame(() => {
        scrollToTarget(target, "auto");
        setTimeout(() => scrollToTarget(target, "auto"), 250);
        setTimeout(() => scrollToTarget(target, "auto"), 900);
    }));
    setTimeout(() => target.classList.remove("awtsmoos-refresh-target"), 2200);
    return target;
}

/** Tears down the current observer so refreshes and tests start clean. */
export function resetVirtualScrollOracle() {
    if (activeObserver) activeObserver.disconnect();
    if (activeScrollHandler) window.removeEventListener("scroll", activeScrollHandler);
    activeObserver = null;
    activeRenderer = null;
    activePruner = null;
    activeTotalChunks = 0;
    activeScrollHandler = null;
    revealed.clear();
}
