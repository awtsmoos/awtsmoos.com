// B"H
/**
 * @module VirtualScrollOracle
 * @description
 * The scroll river has a directional cursor, a visible-owner witness, and a
 * gentle promotion law for already-rendered neighboring verses.
 *
 * Geometry alone is too nervous near verse boundaries. A visible subsection can
 * briefly flicker between two loaded verses, especially when a huge verse is
 * streaming many child sections. This oracle therefore keeps a directional
 * cursor. While scrolling down, the cursor stays with the current verse until
 * that verse's own subsections are complete. While scrolling up, it stays until
 * previous subsections are complete.
 *
 * If the next/previous verse is already rendered, the cursor can promote to it
 * without trying to re-render. That closes the gap where auto-scroll or manual
 * scroll reached a boundary but the oracle refused to move because the chunk was
 * already awake.
 */

import { parseScrollTarget } from "./VirtualScrollMath.js";
import {
    consumeSubsectionScrollIntentFor,
    currentSubsectionGateState,
    ensureSubsectionBufferFor
} from "./SubsectionVirtualizer.js";

export { parseScrollTarget };

const VERSE_AHEAD_PX = 3400;
const MIN_DELTA = 1;
const CURSOR_CORRECTION_PX = 800;
let activeRenderer = null;
let activeTotalChunks = 0;
let activeScrollHandler = null;
let activeCurrent = 0;
let cursorVerse = 0;
let lastDirection = 1;
let lastY = 0;
let streaming = false;
const revealed = new Set();

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
        if (rect.bottom < -520 || rect.top > window.innerHeight + 520) return;
        const d = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (d < distance) { best = node; distance = d; }
    });
    return best ? { node: best, top: best.getBoundingClientRect().top } : null;
}

function preserveAnchor(anchor) {
    if (!anchor?.node?.isConnected) return;
    const delta = anchor.node.getBoundingClientRect().top - anchor.top;
    if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
}

function visibleSubsection() {
    const probe = Math.min(window.innerHeight * 0.42, window.innerHeight - 140);
    let best = null;
    let distance = Infinity;
    document.querySelectorAll(".sub-awtsmoos[data-awtsmoos-idx][data-awtsmoos-sub]").forEach(node => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < -620 || rect.top > window.innerHeight + 620) return;
        const d = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (d < distance) { best = node; distance = d; }
    });
    return best;
}

function visibleVerseIndex() {
    const sub = visibleSubsection();
    if (!sub) return null;
    const idx = Number.parseInt(sub.dataset.awtsmoosIdx || "", 10);
    return Number.isFinite(idx) ? idx : null;
}

function fallbackChunkIndex() {
    const probe = Math.min(window.innerHeight * 0.45, window.innerHeight - 120);
    let best = { id: cursorVerse, distance: Infinity };
    sortedIds().forEach(id => {
        const node = chunkNode(id);
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const d = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (d < best.distance) best = { id, distance: d };
    });
    return best.id;
}

function gateFor(id = cursorVerse) {
    return currentSubsectionGateState(id);
}

function cursorOwnsDirection(direction) {
    const gate = gateFor(cursorVerse);
    if (!gate.hasState) return false;
    if (direction > 0 && gate.canNext) return true;
    if (direction < 0 && gate.canPrev) return true;
    return false;
}

function syncWindowState() {
    activeCurrent = cursorVerse;
    window.__awtsmoosCurrentVerseIndex = cursorVerse;
}

function maybeCorrectCursorByViewport(direction) {
    const visible = visibleVerseIndex();
    if (visible === null || visible === cursorVerse) return;

    const currentNode = chunkNode(cursorVerse);
    const visibleNode = chunkNode(visible);
    if (!currentNode || !visibleNode) return;

    const currentRect = currentNode.getBoundingClientRect();
    const currentGate = gateFor(cursorVerse);

    if (direction > 0) {
        const currentFinished = !currentGate.canNext;
        const clearlyPastCurrent = currentRect.bottom < -CURSOR_CORRECTION_PX;
        if (visible > cursorVerse && currentFinished && clearlyPastCurrent) cursorVerse = visible;
    } else {
        const currentFinished = !currentGate.canPrev;
        const clearlyBeforeCurrent = currentRect.top > window.innerHeight + CURSOR_CORRECTION_PX;
        if (visible < cursorVerse && currentFinished && clearlyBeforeCurrent) cursorVerse = visible;
    }

    syncWindowState();
}

function shouldAwakenNextVerse(force = false) {
    if (cursorVerse >= activeTotalChunks - 1) return false;
    if (gateFor(cursorVerse).canNext) return false;
    if (force) return true;
    const node = chunkNode(cursorVerse);
    if (!node) return false;
    return node.getBoundingClientRect().bottom < window.innerHeight + VERSE_AHEAD_PX;
}

function shouldAwakenPreviousVerse(force = false) {
    if (cursorVerse <= 0) return false;
    if (gateFor(cursorVerse).canPrev) return false;
    if (force) return true;
    const node = chunkNode(cursorVerse);
    if (!node) return false;
    return node.getBoundingClientRect().top > -VERSE_AHEAD_PX;
}

function promoteIfRendered(id, direction) {
    if (!Number.isInteger(id) || id < 0 || id >= activeTotalChunks || !revealed.has(id) || !chunkNode(id)) return false;
    if (direction > 0 && id > cursorVerse && gateFor(cursorVerse).canNext) return false;
    if (direction < 0 && id < cursorVerse && gateFor(cursorVerse).canPrev) return false;
    cursorVerse = id;
    syncWindowState();
    updateLocationFromViewport();
    return true;
}

async function reveal(id, place) {
    if (!Number.isInteger(id) || id < 0 || id >= activeTotalChunks) return false;
    if (revealed.has(id)) return promoteIfRendered(id, place === "before" ? -1 : 1);
    if (streaming) return false;

    streaming = true;
    const anchor = place === "before" ? visibleAnchor() : null;
    await activeRenderer?.(id);
    revealed.add(id);
    if (anchor) preserveAnchor(anchor);

    if (place === "before") cursorVerse = id;
    if (place === "after") cursorVerse = id;

    requestAnimationFrame(() => {
        syncWindowState();
        updateLocationFromViewport();
        lastY = window.scrollY;
        setTimeout(() => { streaming = false; }, 16);
    });
    return true;
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

export async function ensureVerseBuffer(direction = 1, options = {}) {
    const delta = direction >= 0 ? 1 : -1;
    lastDirection = delta;
    maybeCorrectCursorByViewport(delta);

    if (cursorOwnsDirection(delta)) {
        return ensureSubsectionBufferFor(cursorVerse, delta, {
            force: options.force ?? true,
            count: options.count || 12
        });
    }

    if (delta > 0 && shouldAwakenNextVerse(!!options.force)) {
        return reveal(cursorVerse + 1, "after");
    }

    if (delta < 0 && shouldAwakenPreviousVerse(!!options.force)) {
        return reveal(cursorVerse - 1, "before");
    }

    return false;
}

async function handleScrollIntent(delta) {
    if (Math.abs(delta) < MIN_DELTA) return;
    const direction = delta >= 0 ? 1 : -1;
    lastDirection = direction;
    maybeCorrectCursorByViewport(direction);

    const innerConsumed = consumeSubsectionScrollIntentFor(cursorVerse, direction, { count: 12, force: false });
    updateLocationFromViewport();
    if (innerConsumed || cursorOwnsDirection(direction)) return;

    await ensureVerseBuffer(direction, { count: 12 });
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
            await handleScrollIntent(delta || lastDirection);
        });
    };
    lastY = window.scrollY;
    window.addEventListener("scroll", activeScrollHandler, { passive: true });
    window.addEventListener("wheel", activeScrollHandler, { passive: true });
    window.addEventListener("touchmove", activeScrollHandler, { passive: true });
    setInterval(() => {
        maybeCorrectCursorByViewport(lastDirection);
        updateLocationFromViewport();
    }, 700);
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

export function awakenVirtualScrollOracle({ totalChunks, renderChunk, currentChunk = 0 } = {}) {
    resetVirtualScrollOracle();
    activeRenderer = renderChunk;
    activeTotalChunks = Math.max(0, Number(totalChunks) || 0);
    cursorVerse = currentChunk;
    activeCurrent = currentChunk;
    syncWindowState();
    revealed.add(currentChunk);
    window.__awtsmoosAutoScrollVerseBuffer = ensureVerseBuffer;
    attach();
}

export async function restoreScrollTarget(query, renderChunk, chunkSize) {
    const { idx, sub } = targetFromQuery(query);
    if (!Number.isFinite(idx)) return null;
    const chunkId = Math.floor(idx / chunkSize);
    cursorVerse = chunkId;
    activeCurrent = chunkId;
    syncWindowState();
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
    activeTotalChunks = 0;
    activeScrollHandler = null;
    activeCurrent = 0;
    cursorVerse = 0;
    lastDirection = 1;
    lastY = 0;
    streaming = false;
    revealed.clear();
    if (window.__awtsmoosAutoScrollVerseBuffer === ensureVerseBuffer) delete window.__awtsmoosAutoScrollVerseBuffer;
}
