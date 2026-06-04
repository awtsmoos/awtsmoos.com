// B"H
/**
 * @module VirtualScrollOracle
 * @description
 * The outer verse river bows to the inner subsection river.
 *
 * This oracle now refuses to prune verse chunks while the reader is moving. It
 * may append road ahead, or prepend road above with anchor preservation, but it
 * cleans old distant vessels only after the scroll river becomes idle.
 */

import { parseScrollTarget } from "./VirtualScrollMath.js";
import {
    consumeSubsectionScrollIntent,
    currentSubsectionGateState
} from "./SubsectionVirtualizer.js";

export { parseScrollTarget };

const VERSE_AHEAD_PX = 1100;
const PRUNE_PX = 3600;
const MOTION_IDLE_MS = 1100;
const MIN_DELTA = 2;
const MAX_CHUNKS = 4;
let activeRenderer = null;
let activePruner = null;
let activeTotalChunks = 0;
let activeScrollHandler = null;
let activeCurrent = 0;
let lastY = 0;
let streaming = false;
let idlePruneTimer = 0;
const revealed = new Set();

function isAutoMoving() {
    return document.body?.classList?.contains("awtsmoos-auto-scroll-active") && !document.body?.classList?.contains("awtsmoos-auto-scroll-paused");
}

function markMotion() {
    window.__awtsmoosVirtualMotionActive = true;
    clearTimeout(idlePruneTimer);
    idlePruneTimer = setTimeout(() => {
        window.__awtsmoosVirtualMotionActive = false;
        if (isAutoMoving()) {
            markMotion();
            return;
        }
        pruneFarChunksIdle();
    }, MOTION_IDLE_MS);
}

function chunkNode(id) {
    return document.querySelector(`#virtual-scroll-container > .scroll-chunk[data-chunk-id="${id}"]`);
}

function sortedIds() {
    return [...revealed].sort((a, b) => a - b).filter(id => chunkNode(id));
}

function visibleAnchor() {
    const probe = Math.min(window.innerHeight * 0.36, window.innerHeight - 160);
    let best = null;
    let distance = Infinity;
    document.querySelectorAll("#realPost .sub-awtsmoos[data-awtsmoos-substate='awake'], #realPost .section").forEach(node => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < -240 || rect.top > window.innerHeight + 240) return;
        const d = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (d < distance) {
            best = node;
            distance = d;
        }
    });
    return best ? { node: best, top: best.getBoundingClientRect().top } : null;
}

function preserveAnchor(anchor) {
    if (!anchor?.node?.isConnected) return;
    const nextTop = anchor.node.getBoundingClientRect().top;
    const delta = nextTop - anchor.top;
    if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
}

function currentChunkNode() {
    updateCurrentFromViewport();
    return chunkNode(activeCurrent);
}

function shouldAwakenNextVerse(force = false) {
    if (activeCurrent >= activeTotalChunks - 1) return false;
    if (force) return true;
    const node = currentChunkNode();
    if (!node) return false;
    return node.getBoundingClientRect().bottom < window.innerHeight + VERSE_AHEAD_PX;
}

function shouldAwakenPreviousVerse(force = false) {
    if (activeCurrent <= 0) return false;
    if (force) return true;
    const node = currentChunkNode();
    if (!node) return false;
    return node.getBoundingClientRect().top > -VERSE_AHEAD_PX;
}

function pruneFarChunksIdle() {
    if (window.__awtsmoosVirtualMotionActive || isAutoMoving()) return;
    const ids = sortedIds();
    if (ids.length <= MAX_CHUNKS) return;
    const anchor = visibleAnchor();
    ids.forEach(id => {
        if (id === activeCurrent || revealed.size <= MAX_CHUNKS) return;
        const node = chunkNode(id);
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const safelyAbove = rect.bottom < -PRUNE_PX;
        const safelyBelow = rect.top > window.innerHeight + PRUNE_PX;
        if (!safelyAbove && !safelyBelow) return;
        activePruner?.(id);
        revealed.delete(id);
    });
    preserveAnchor(anchor);
}

async function reveal(id, place) {
    if (streaming || !Number.isInteger(id) || id < 0 || id >= activeTotalChunks || revealed.has(id)) return false;
    streaming = true;
    markMotion();
    const anchor = place === "before" ? visibleAnchor() : null;
    await activeRenderer?.(id);
    revealed.add(id);
    if (anchor) preserveAnchor(anchor);
    requestAnimationFrame(() => {
        updateCurrentFromViewport();
        updateLocationFromViewport();
        lastY = window.scrollY;
        setTimeout(() => { streaming = false; }, 45);
    });
    return true;
}

function updateCurrentFromViewport() {
    const probe = Math.min(window.innerHeight * 0.45, window.innerHeight - 120);
    let best = { id: activeCurrent, distance: Infinity };
    sortedIds().forEach(id => {
        const node = chunkNode(id);
        if (!node) return;
        const rect = node.getBoundingClientRect();
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
        if (d < distance) {
            best = node;
            distance = d;
        }
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

export async function ensureVerseBuffer(direction = 1, options = {}) {
    const delta = direction >= 0 ? 1 : -1;
    if (subsectionStillOwnsDirection(delta)) return false;
    if (delta > 0 && shouldAwakenNextVerse(!!options.force)) return reveal(activeCurrent + 1, "after");
    if (delta < 0 && shouldAwakenPreviousVerse(!!options.force)) return reveal(activeCurrent - 1, "before");
    return false;
}

async function handleScrollIntent(delta) {
    if (streaming || Math.abs(delta) < MIN_DELTA) return;
    markMotion();

    const innerConsumed = consumeSubsectionScrollIntent(delta, { count: 2 });
    updateCurrentFromViewport();
    updateLocationFromViewport();

    if (innerConsumed || subsectionStillOwnsDirection(delta)) return;
    await ensureVerseBuffer(delta >= 0 ? 1 : -1);
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
    window.__awtsmoosAutoScrollVerseBuffer = ensureVerseBuffer;
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
    clearTimeout(idlePruneTimer);
    activeRenderer = null;
    activePruner = null;
    activeTotalChunks = 0;
    activeScrollHandler = null;
    activeCurrent = 0;
    lastY = 0;
    streaming = false;
    revealed.clear();
    if (window.__awtsmoosAutoScrollVerseBuffer === ensureVerseBuffer) delete window.__awtsmoosAutoScrollVerseBuffer;
}
