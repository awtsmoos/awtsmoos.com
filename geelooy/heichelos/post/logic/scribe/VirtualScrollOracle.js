// B"H
/**
 * @module VirtualScrollOracle
 * @description
 * Chapter 276: The oracle becomes a lean river-master.
 *
 * Visibility, coordinates, and target math now live in smaller vessels. This
 * file only keeps the living scroll contract: add ahead in the scroll
 * direction, never remove awakened chunks, and preserve the reader's flow.
 */

import { parseScrollTarget, chunkWindow, chunksToPrune, additiveAheadWindow } from "./VirtualScrollMath.js";
import { currentSubsectionGateState } from "./SubsectionVirtualizer.js";
import { chunkNode, visibleChunkId } from "./VirtualScrollVisibility.js";
import { exactTarget, scrollToTarget, targetFromQuery } from "./VirtualScrollTarget.js";
import { markVisibleCoordinate } from "./VirtualScrollCoordinates.js";

export { parseScrollTarget, chunkWindow, chunksToPrune, additiveAheadWindow };

const AHEAD_PX = 5600;
const PREFETCH_STEPS = 5;
const MIN_DELTA = 1;
const HEARTBEAT_MS = 720;
let renderVerse = null;
let totalVerses = 0;
let scrollHandler = null;
let heartbeatId = 0;
let cursorVerse = 0;
let lastY = 0;
let lastDirection = 1;
let queue = Promise.resolve(false);
const revealed = new Set();

function syncGlobals() {
    window.__awtsmoosCurrentVerseIndex = cursorVerse;
    window.__awtsmoosRevealedVerseChunks = [...revealed].sort((a, b) => a - b);
}

function gateAllowsPast(id, direction) {
    const gate = currentSubsectionGateState(id);
    if (!gate.hasState) return true;
    return direction > 0 ? !gate.canNext : !gate.canPrev;
}

function adoptVisibleCursor(direction) {
    const visible = visibleChunkId(cursorVerse);
    if (!Number.isInteger(visible) || visible === cursorVerse || !revealed.has(visible)) return;
    if (direction > 0 && visible > cursorVerse && gateAllowsPast(cursorVerse, 1)) cursorVerse = visible;
    if (direction < 0 && visible < cursorVerse && gateAllowsPast(cursorVerse, -1)) cursorVerse = visible;
    syncGlobals();
}

async function reveal(id) {
    if (!Number.isInteger(id) || id < 0 || id >= totalVerses) return false;
    if (revealed.has(id) && chunkNode(id)) return true;
    const node = await renderVerse?.(id);
    if (!node) return false;
    revealed.add(id);
    syncGlobals();
    return true;
}

function nearGate(direction, force) {
    if (force) return true;
    const base = chunkNode(cursorVerse);
    if (!base) return false;
    const rect = base.getBoundingClientRect();
    return direction > 0 ? rect.bottom < window.innerHeight + AHEAD_PX : rect.top > -AHEAD_PX;
}

function wantedIds(direction, force = false) {
    if (!nearGate(direction, force)) return [];
    return additiveAheadWindow(cursorVerse, totalVerses, direction, PREFETCH_STEPS);
}

function schedulePrewarm(direction, options = {}) {
    const normalized = direction >= 0 ? 1 : -1;
    if (!gateAllowsPast(cursorVerse, normalized) && !options.force) return queue;
    const ids = wantedIds(normalized, !!options.force);
    queue = queue.then(async () => {
        for (const id of ids) await reveal(id);
        adoptVisibleCursor(normalized);
        markVisibleCoordinate(cursorVerse);
        return ids.length > 0;
    }).catch(error => {
        console.warn("B\"H VirtualScrollOracle prewarm resisted", error);
        return false;
    });
    return queue;
}

function handleIntent(delta) {
    if (Math.abs(delta) < MIN_DELTA) return false;
    lastDirection = delta >= 0 ? 1 : -1;
    adoptVisibleCursor(lastDirection);
    markVisibleCoordinate(cursorVerse);
    return schedulePrewarm(lastDirection);
}

function attachListeners() {
    let raf = 0;
    scrollHandler = event => {
        const eventDelta = typeof event?.deltaY === "number" ? event.deltaY : window.scrollY - lastY;
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            const scrollDelta = window.scrollY - lastY;
            lastY = window.scrollY;
            handleIntent(Math.abs(eventDelta) > Math.abs(scrollDelta) ? eventDelta : scrollDelta || lastDirection);
        });
    };
    lastY = window.scrollY;
    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("wheel", scrollHandler, { passive: true });
    window.addEventListener("touchmove", scrollHandler, { passive: true });
    heartbeatId = window.setInterval(() => handleIntent(lastDirection), HEARTBEAT_MS);
}

export function awakenVirtualScrollOracle({ totalChunks, renderChunk, currentChunk = 0 } = {}) {
    resetVirtualScrollOracle();
    renderVerse = renderChunk;
    totalVerses = Math.max(0, Number(totalChunks) || 0);
    cursorVerse = Math.max(0, Math.min(currentChunk, Math.max(0, totalVerses - 1)));
    revealed.add(cursorVerse);
    syncGlobals();
    window.__awtsmoosAutoScrollVerseBuffer = ensureVerseBuffer;
    attachListeners();
    schedulePrewarm(1, { force: true });
}

export async function restoreScrollTarget(query, renderChunk) {
    const { idx, sub } = targetFromQuery(query);
    if (!Number.isFinite(idx)) return null;
    cursorVerse = Math.max(0, Math.min(idx, Math.max(0, totalVerses - 1)));
    revealed.add(cursorVerse);
    syncGlobals();
    await renderChunk(cursorVerse);
    await schedulePrewarm(1, { force: true });
    await schedulePrewarm(-1, { force: true });
    const target = exactTarget(idx, sub);
    if (!target) return null;
    target.classList.add("awtsmoos-refresh-target");
    requestAnimationFrame(() => requestAnimationFrame(() => {
        scrollToTarget(target);
        markVisibleCoordinate(cursorVerse);
        lastY = window.scrollY;
    }));
    setTimeout(() => target.classList.remove("awtsmoos-refresh-target"), 2200);
    return target;
}

export function ensureVerseBuffer(direction = 1, options = {}) {
    return schedulePrewarm(direction >= 0 ? 1 : -1, options);
}

export function resetVirtualScrollOracle() {
    if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler);
        window.removeEventListener("wheel", scrollHandler);
        window.removeEventListener("touchmove", scrollHandler);
    }
    if (heartbeatId) window.clearInterval(heartbeatId);
    renderVerse = null;
    totalVerses = 0;
    scrollHandler = null;
    heartbeatId = 0;
    cursorVerse = 0;
    lastY = 0;
    lastDirection = 1;
    queue = Promise.resolve(false);
    revealed.clear();
    if (window.__awtsmoosAutoScrollVerseBuffer === ensureVerseBuffer) window.__awtsmoosAutoScrollVerseBuffer = null;
}
