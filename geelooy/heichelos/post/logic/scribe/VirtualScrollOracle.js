// B"H
/**
 * @module VirtualScrollOracle
 * @description
 * The outer verse river bows to the inner subsection river.
 *
 * Hard law: a next verse may not awaken while the current verse still has a
 * hidden next subsection. A previous verse may not awaken while the current
 * verse still has a hidden previous subsection. The Awtsmoos completes the
 * inner world before birthing the outer world.
 */

import { parseScrollTarget } from "./VirtualScrollMath.js";
import {
    consumeSubsectionScrollIntent,
    currentSubsectionGateState
} from "./SubsectionVirtualizer.js";

export { parseScrollTarget };

const VERSE_AHEAD_PX = 520;
const PRUNE_PX = 1500;
const MIN_DELTA = 3;
const MAX_CHUNKS = 3;
let activeRenderer = null;
let activePruner = null;
let activeTotalChunks = 0;
let activeScrollHandler = null;
let activeCurrent = 0;
let lastY = 0;
let streaming = false;
const revealed = new Set();

function chunkNode(id) {
    return document.querySelector(`#virtual-scroll-container > .scroll-chunk[data-chunk-id="${id}"]`);
}

function sortedIds() {
    return [...revealed].sort((a, b) => a - b).filter(id => chunkNode(id));
}

function preserveIfRemovingAbove(node) {
    const rect = node.getBoundingClientRect();
    return rect.bottom < 0 ? Math.max(0, rect.height) : 0;
}

function currentChunkNode() {
    updateCurrentFromViewport();
    return chunkNode(activeCurrent);
}

function shouldAwakenNextVerse() {
    const node = currentChunkNode();
    if (!node) return false;
    return node.getBoundingClientRect().bottom < window.innerHeight + VERSE_AHEAD_PX;
}

function shouldAwakenPreviousVerse() {
    const node = currentChunkNode();
    if (!node) return false;
    return node.getBoundingClientRect().top > -VERSE_AHEAD_PX;
}

function pruneFarChunks() {
    const ids = sortedIds();
    if (ids.length <= MAX_CHUNKS) return;
    ids.forEach(id => {
        if (id === activeCurrent || revealed.size <= MAX_CHUNKS) return;
        const node = chunkNode(id);
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const safelyAbove = rect.bottom < -PRUNE_PX;
        const safelyBelow = rect.top > window.innerHeight + PRUNE_PX;
        if (!safelyAbove && !safelyBelow) return;
        const correction = preserveIfRemovingAbove(node);
        activePruner?.(id);
        revealed.delete(id);
        if (correction) window.scrollBy(0, -correction);
    });
}

async function reveal(id, place) {
    if (streaming || !Number.isInteger(id) || id < 0 || id >= activeTotalChunks || revealed.has(id)) return false;
    streaming = true;
    await activeRenderer?.(id);
    revealed.add(id);
    if (place === "before") {
        const node = chunkNode(id);
        const height = node?.getBoundingClientRect().height || 0;
        if (height) window.scrollBy(0, height);
    }
    requestAnimationFrame(() => {
        updateCurrentFromViewport();
        updateLocationFromViewport();
        pruneFarChunks();
        lastY = window.scrollY;
        setTimeout(() => { streaming = false; }, 70);
    });
    return true;
}

function updateCurrentFromViewport() {
    const probe = Math.min(window.innerHeight * 0.45, window.innerHeight - 120);
    let best = { id: activeCurrent, distance: Infinity };
    sortedIds().forEach(id => {
        const rect = chunkNode(id).getBoundingClientRect();
        const distance = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (distance < best.distance) best = { id, distance };
    });
    activeCurrent = best.id;
}

function visibleSubsection() {
    const probe = Math.min(window.innerHeight * 0.48, window.innerHeight - 120);
    const awake = [...document.querySelectorAll(".sub-awtsmoos[data-awtsmoos-idx][data-awtsmoos-sub]")];
    let best = null;
    let distance = Infinity;
    awake.forEach(node => {
        const rect = node.getBoundingClientRect();
        const d = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (d < distance) { best = node; distance = d; }
    });
    return best;
}

function markVisible(node) {
    document.querySelectorAll(".awtsmoos-current-section, .awtsmoos-current-subsection").forEach(el => {
        el.classList.remove("awtsmoos-current-section", "awtsmoos-current-subsection");
    });
    if (!node) return;
    node.classList.add("awtsmoos-current-subsection");
    node.closest(".section")?.classList.add("awtsmoos-current-section");
}

function updateLocationFromViewport() {
    const node = visibleSubsection();
    if (!node) return;
    markVisible(node);
    const idx = node.dataset.awtsmoosIdx;
    const sub = node.dataset.awtsmoosSub;
    const url = new URL(location.href);
    url.searchParams.set("idx", idx);
    url.searchParams.set("sub", sub);
    history.replaceState(history.state, "", url);
    window.dispatchEvent(new CustomEvent("awtsmoos:coordinates", { detail: { idx: Number(idx), sub: Number(sub) } }));
}

function subsectionStillOwnsDirection(delta) {
    const gate = currentSubsectionGateState();
    if (!gate.hasState) return false;
    if (delta > 0 && gate.canNext) return true;
    if (delta < 0 && gate.canPrev) return true;
    return false;
}

async function handleScrollIntent(delta) {
    if (streaming || Math.abs(delta) < MIN_DELTA) return;

    const innerConsumed = consumeSubsectionScrollIntent(delta);
    updateCurrentFromViewport();
    updateLocationFromViewport();

    if (innerConsumed || subsectionStillOwnsDirection(delta)) {
        pruneFarChunks();
        return;
    }

    if (delta > 0 && shouldAwakenNextVerse()) await reveal(activeCurrent + 1, "after");
    if (delta < 0 && shouldAwakenPreviousVerse()) await reveal(activeCurrent - 1, "before");
    pruneFarChunks();
}

function attach() {
    let raf = 0;
    activeScrollHandler = event => {
        const eventDelta = typeof event?.deltaY === "number" ? event.deltaY : window.scrollY - lastY;
        if (raf) return;
        raf = requestAnimationFrame(async () => {
            raf = 0;
            const scrollDelta = window.scrollY - lastY;
            const delta = Math.abs(eventDelta) > Math.abs(scrollDelta) ? eventDelta : scrollDelta;
            lastY = window.scrollY;
            await handleScrollIntent(delta);
        });
    };
    lastY = window.scrollY;
    window.addEventListener("scroll", activeScrollHandler, { passive: true });
    window.addEventListener("wheel", activeScrollHandler, { passive: true });
    window.addEventListener("touchmove", activeScrollHandler, { passive: true });
    setInterval(updateLocationFromViewport, 700);
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
    if (sub !== null && Number.isFinite(sub)) return window.__awtsmoosRevealSubsection?.(idx, sub) || section;
    return section;
}

function topOffset() {
    const header = document.querySelector(".awtsmoos-integrated-header")?.getBoundingClientRect().height || 0;
    return Math.max(18, header) + 18;
}

function scrollToTarget(target) {
    const y = target.getBoundingClientRect().top + window.pageYOffset - topOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
}

export function awakenVirtualScrollOracle({ totalChunks, renderChunk, unrenderChunk, currentChunk = 0 } = {}) {
    resetVirtualScrollOracle();
    activeRenderer = renderChunk;
    activePruner = unrenderChunk;
    activeTotalChunks = Math.max(0, Number(totalChunks) || 0);
    activeCurrent = currentChunk;
    revealed.add(currentChunk);
    attach();
}

export async function restoreScrollTarget(query, renderChunk, chunkSize) {
    const { idx, sub } = targetFromQuery(query);
    if (!Number.isFinite(idx)) return null;
    const chunkId = Math.floor(idx / chunkSize);
    activeCurrent = chunkId;
    revealed.add(chunkId);
    await renderChunk(chunkId);
    const target = exactTarget(idx, sub);
    if (!target) return null;
    target.classList.add("awtsmoos-refresh-target");
    requestAnimationFrame(() => requestAnimationFrame(() => {
        scrollToTarget(target);
        updateLocationFromViewport();
        lastY = window.scrollY;
    }));
    setTimeout(() => target.classList.remove("awtsmoos-refresh-target"), 2200);
    return target;
}

export function resetVirtualScrollOracle() {
    if (activeScrollHandler) {
        window.removeEventListener("scroll", activeScrollHandler);
        window.removeEventListener("wheel", activeScrollHandler);
        window.removeEventListener("touchmove", activeScrollHandler);
    }
    activeRenderer = null;
    activePruner = null;
    activeTotalChunks = 0;
    activeScrollHandler = null;
    activeCurrent = 0;
    lastY = 0;
    streaming = false;
    revealed.clear();
}
