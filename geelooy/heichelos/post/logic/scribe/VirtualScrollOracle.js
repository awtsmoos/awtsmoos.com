// B"H
/**
 * @module VirtualScrollOracle
 * @description
 * Chapter 284: The oracle now survives the thin-scroll illusion.
 *
 * When the user reaches the bottom of the currently rendered stream, the visible
 * chunk probe can remain stuck on an old verse because the next verses do not
 * exist yet. The oracle therefore advances from the rendered edge whenever the
 * real scroll root is near its bottom/top. It still never prunes or replaces;
 * it only appends more reader road in both directions.
 */

import { parseScrollTarget, chunkWindow, chunksToPrune, additiveAheadWindow } from "./VirtualScrollMath.js";
import { currentSubsectionGateState } from "./SubsectionVirtualizer.js";
import { chunkNode, visibleChunkId } from "./VirtualScrollVisibility.js";
import { exactTarget, scrollToTarget, targetFromQuery } from "./VirtualScrollTarget.js";
import { markVisibleCoordinate } from "./VirtualScrollCoordinates.js";
import { addRootScrollListener, bottomDistanceOf, rootDiagnostics, scrollRoot, scrollTopOf } from "./VirtualScrollRoot.js";

export { parseScrollTarget, chunkWindow, chunksToPrune, additiveAheadWindow };

const AHEAD_PX = 6400;
const TOP_PX = 1900;
const PREFETCH_STEPS = 10;
const HEARTBEAT_MS = 240;
const MIN_DELTA = 1;
let renderVerse = null;
let totalVerses = 0;
let detachScroll = null;
let heartbeatId = 0;
let cursorVerse = 0;
let lastY = 0;
let lastDirection = 1;
let queue = Promise.resolve(false);
const revealed = new Set();

function syncGlobals() {
    window.__awtsmoosCurrentVerseIndex = cursorVerse;
    window.__awtsmoosRevealedVerseChunks = [...revealed].sort((a, b) => a - b);
    window.__awtsmoosVirtualScrollRoot = rootDiagnostics();
}

function minRevealed() {
    return revealed.size ? Math.min(...revealed) : cursorVerse;
}

function maxRevealed() {
    return revealed.size ? Math.max(...revealed) : cursorVerse;
}

function gateAllowsPast(id, direction) {
    const gate = currentSubsectionGateState(id);
    if (!gate.hasState) return true;
    return direction > 0 ? !gate.canNext : !gate.canPrev;
}

function edgeCursor(direction) {
    const root = scrollRoot();
    if (direction > 0 && bottomDistanceOf(root) < AHEAD_PX) return maxRevealed();
    if (direction < 0 && scrollTopOf(root) < TOP_PX) return minRevealed();
    return cursorVerse;
}

function adoptVisibleCursor(direction) {
    const visible = visibleChunkId(cursorVerse);
    if (Number.isInteger(visible) && revealed.has(visible)) {
        if (direction > 0 && visible > cursorVerse && gateAllowsPast(cursorVerse, 1)) cursorVerse = visible;
        if (direction < 0 && visible < cursorVerse && gateAllowsPast(cursorVerse, -1)) cursorVerse = visible;
    }
    const edge = edgeCursor(direction);
    if (direction > 0 && edge > cursorVerse && gateAllowsPast(cursorVerse, 1)) cursorVerse = edge;
    if (direction < 0 && edge < cursorVerse && gateAllowsPast(cursorVerse, -1)) cursorVerse = edge;
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
    const root = scrollRoot();
    if (direction > 0) return bottomDistanceOf(root) < AHEAD_PX;
    return scrollTopOf(root) < TOP_PX;
}

function wantedIds(direction, force = false, count = PREFETCH_STEPS) {
    if (!nearGate(direction, force)) return [];
    const base = edgeCursor(direction);
    return additiveAheadWindow(base, totalVerses, direction, count);
}

function schedulePrewarm(direction, options = {}) {
    const normalized = direction >= 0 ? 1 : -1;
    adoptVisibleCursor(normalized);
    if (!gateAllowsPast(cursorVerse, normalized) && !options.force) return queue;
    const ids = wantedIds(normalized, !!options.force, Number(options.count || PREFETCH_STEPS));
    queue = queue.then(async () => {
        let opened = false;
        for (const id of ids) opened = (await reveal(id)) || opened;
        adoptVisibleCursor(normalized);
        markVisibleCoordinate(cursorVerse);
        return opened;
    }).catch(error => {
        console.warn("B\"H VirtualScrollOracle prewarm resisted", error);
        return false;
    });
    return queue;
}

function handleIntent(delta, options = {}) {
    const forced = !!options.force;
    if (!forced && Math.abs(delta) < MIN_DELTA) return false;
    lastDirection = delta >= 0 ? 1 : -1;
    adoptVisibleCursor(lastDirection);
    markVisibleCoordinate(cursorVerse);
    return schedulePrewarm(lastDirection, options);
}

function eventDelta(event, nextY) {
    if (typeof event?.deltaY === "number") return event.deltaY;
    if (event?.key === "ArrowDown" || event?.key === "PageDown" || event?.key === "End" || event?.key === " ") return 1;
    if (event?.key === "ArrowUp" || event?.key === "PageUp" || event?.key === "Home") return -1;
    return nextY - lastY;
}

function attachListeners() {
    let raf = 0;
    lastY = scrollTopOf(scrollRoot());
    const handler = event => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            const nextY = scrollTopOf(scrollRoot());
            const delta = eventDelta(event, nextY);
            const scrollDelta = nextY - lastY;
            lastY = nextY;
            handleIntent(Math.abs(delta) > Math.abs(scrollDelta) ? delta : scrollDelta || lastDirection);
        });
    };
    detachScroll = addRootScrollListener(handler);
    heartbeatId = window.setInterval(() => {
        syncGlobals();
        const root = scrollRoot();
        const forced = bottomDistanceOf(root) < AHEAD_PX || scrollTopOf(root) < TOP_PX;
        handleIntent(lastDirection, { force: forced, count: PREFETCH_STEPS });
    }, HEARTBEAT_MS);
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
    schedulePrewarm(1, { force: true, count: PREFETCH_STEPS });
    schedulePrewarm(-1, { force: true, count: PREFETCH_STEPS });
}

export async function restoreScrollTarget(query, renderChunk) {
    const { idx, sub } = targetFromQuery(query);
    if (!Number.isFinite(idx)) return null;
    cursorVerse = Math.max(0, Math.min(idx, Math.max(0, totalVerses - 1)));
    revealed.add(cursorVerse);
    syncGlobals();
    await renderChunk(cursorVerse);
    await schedulePrewarm(1, { force: true, count: PREFETCH_STEPS });
    await schedulePrewarm(-1, { force: true, count: PREFETCH_STEPS });
    const target = exactTarget(idx, sub);
    if (!target) return null;
    target.classList.add("awtsmoos-refresh-target");
    requestAnimationFrame(() => requestAnimationFrame(() => {
        scrollToTarget(target);
        markVisibleCoordinate(cursorVerse);
        lastY = scrollTopOf(scrollRoot());
    }));
    setTimeout(() => target.classList.remove("awtsmoos-refresh-target"), 2200);
    return target;
}

export function ensureVerseBuffer(direction = 1, options = {}) {
    return schedulePrewarm(direction >= 0 ? 1 : -1, { ...options, force: true });
}

export function resetVirtualScrollOracle() {
    detachScroll?.();
    if (heartbeatId) window.clearInterval(heartbeatId);
    renderVerse = null;
    totalVerses = 0;
    detachScroll = null;
    heartbeatId = 0;
    cursorVerse = 0;
    lastY = 0;
    lastDirection = 1;
    queue = Promise.resolve(false);
    revealed.clear();
    if (window.__awtsmoosAutoScrollVerseBuffer === ensureVerseBuffer) window.__awtsmoosAutoScrollVerseBuffer = null;
    window.__awtsmoosVirtualScrollRoot = null;
}
