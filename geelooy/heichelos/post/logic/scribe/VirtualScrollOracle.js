// B"H
/**
 * @module VirtualScrollOracle
 * @description
 * Chapter 4: The oracle becomes lean. Math lives in its own chamber; this file
 * only listens to the viewport, asks nearby chunks to awaken, and sends distant
 * chunks back to placeholder sleep.
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

/**
 * Starts dynamic chunk revelation for the current scroll.
 * @param {object} options Oracle options.
 * @param {number} options.totalChunks Total scaffold chunks.
 * @param {(chunkId:number)=>Promise<void>} options.renderChunk Renderer.
 * @param {(chunkId:number)=>boolean} options.unrenderChunk Unrenderer.
 * @param {Element} [options.root] Optional scroll root.
 */
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
    const { idx, sub } = parseScrollTarget(query);
    await renderChunk(Math.floor(idx / chunkSize));
    const selector = sub === null
        ? `[data-awtsmoos-idx="${idx}"]`
        : `[data-awtsmoos-idx="${idx}"][data-awtsmoos-sub="${sub}"]`;
    const target = document.querySelector(selector) || document.querySelector(`[data-awtsmoos-idx="${idx}"]`);
    if (!target) return null;
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    target.classList.add("awtsmoos-refresh-target");
    setTimeout(() => target.classList.remove("awtsmoos-refresh-target"), 1800);
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
