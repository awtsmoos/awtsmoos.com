// B"H
/**
 * @module AutoScrollDown
 * @description
 * Chapter 306: The green river follows the real scroll world without assuming
 * `document.body` exists in tests. It prefers an actually scrollable wrapper,
 * otherwise the document, and keeps virtualization fed near the bottom.
 */

const DEFAULT_SPEED = 2.4;
const MIN_SPEED = 0.35;
const MAX_SPEED = 14;
const SPEED_KEY = "awtsmoos-auto-scroll-speed";
const RESUME_DELAY_MS = 420;
const TOUCH_MOVE_THRESHOLD = 26;
const SCROLL_MOVE_THRESHOLD = 18;
const WHEEL_THRESHOLD = 32;
const BUFFER_DISTANCE = 6200;
const FORCE_DISTANCE = 1100;
const MAX_STALLED_FRAMES = 34;

let gesture = null;
let bufferPending = false;
let stalledFrames = 0;
let scrollState = { active: false, paused: false, raf: 0, resumeTimer: 0, listenersBound: false, speed: readSavedSpeed() };

function frame(callback) { return setTimeout(() => callback(Date.now()), 0); }
function cancelFrame(id) { if (id) clearTimeout(id); }
function clearResumeTimer() { if (scrollState.resumeTimer) clearTimeout(scrollState.resumeTimer); scrollState.resumeTimer = 0; }
function emitState() { window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-state", { detail: getAutoScrollDownState() })); }
function html() { return document.documentElement || document.scrollingElement || null; }
function body() { return document.body || null; }
function documentRoot() { return document.scrollingElement || html() || body(); }
function number(value) { return Number(value || 0); }
function documentTop() { return window.scrollY || number(html()?.scrollTop) || number(body()?.scrollTop); }
function documentHeight() { return Math.max(number(body()?.scrollHeight), number(html()?.scrollHeight), number(documentRoot()?.scrollHeight)); }
function documentViewport() { return window.innerHeight || number(html()?.clientHeight) || number(documentRoot()?.clientHeight); }
function documentMax() { return Math.max(0, documentHeight() - documentViewport()); }
function elementMax(root) { return Math.max(0, number(root?.scrollHeight) - number(root?.clientHeight || window.innerHeight)); }
function isDoc(root) { const doc = documentRoot(); return root === doc || root === body() || root === html(); }
function readTop(root) { return isDoc(root) ? documentTop() : number(root?.scrollTop); }
function maxScroll(root) { return isDoc(root) ? documentMax() : elementMax(root); }
function writeTop(root, top) { const safe = Math.max(0, Math.min(maxScroll(root), top)); if (!isDoc(root)) { if (root) root.scrollTop = safe; return; } if (typeof window.scrollTo === "function") window.scrollTo({ top: safe, behavior: "auto" }); const doc = documentRoot(); if (doc) doc.scrollTop = safe; if (html()) html().scrollTop = safe; if (body()) body().scrollTop = safe; }

function styleAllowsScroll(root) {
    if (!root || isDoc(root)) return true;
    if (typeof getComputedStyle !== "function") return true;
    const style = getComputedStyle(root);
    return /(auto|scroll|overlay|visible)/.test(`${style.overflowY || ""} ${style.overflow || ""}`);
}

function movableScore(root, priority = 0) {
    if (!root || maxScroll(root) <= 2 || !styleAllowsScroll(root)) return -1;
    const original = readTop(root);
    try {
        writeTop(root, original + 13);
        const moved = Math.abs(readTop(root) - original) > 0.5;
        writeTop(root, original);
        return moved ? priority * 1000000 + maxScroll(root) : -1;
    } catch (_) { return -1; }
}

function describeRoot(root, score) {
    return { kind: isDoc(root) ? "document" : "element", tag: root?.tagName || "", id: root?.id || "", className: String(root?.className || ""), scrollTop: readTop(root), maxScroll: maxScroll(root), score };
}

function scrollRoot() {
    const rows = [[document.querySelector?.(".scroll-view-wrapper"), 1000], [document.querySelector?.(".post-reader-localized-context .main"), 990], [document.querySelector?.("#realPost"), 980], [documentRoot(), 950]];
    let winner = documentRoot();
    let best = movableScore(winner, 950);
    for (const [root, priority] of rows) {
        const score = movableScore(root, priority);
        if (score > best) { best = score; winner = root; }
    }
    window.__awtsmoosAutoScrollRootDiagnostics = describeRoot(winner, best);
    return winner || documentRoot();
}

function bottomDistance(root) { return maxScroll(root) - readTop(root); }
function boundedSpeed(value) { const parsed = Number.parseFloat(value); return Number.isFinite(parsed) ? Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsed)) : DEFAULT_SPEED; }
function readSavedSpeed() { try { return boundedSpeed(localStorage.getItem(SPEED_KEY) || DEFAULT_SPEED); } catch { return DEFAULT_SPEED; } }
function writeSavedSpeed(speed) { try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {} }

function requestRoadAhead(force = false) {
    if (bufferPending) return;
    bufferPending = true;
    Promise.resolve().then(async () => {
        try { const opened = await window.__awtsmoosAutoScrollVerseBuffer?.(1, { force, count: force ? 16 : 10 }); if (opened) stalledFrames = 0; }
        catch (error) { console.warn("B\"H auto-scroll indexed buffer request resisted", error); }
        finally { bufferPending = false; }
    });
}

function continueNextFrame() { scrollState.raf = frame(step); }
function step() {
    if (!scrollState.active) return;
    if (scrollState.paused) return continueNextFrame();
    const root = scrollRoot();
    const before = readTop(root);
    const distance = bottomDistance(root);
    if (distance < BUFFER_DISTANCE) requestRoadAhead(false);
    if (distance < FORCE_DISTANCE) requestRoadAhead(true);
    writeTop(root, before + scrollState.speed);
    const moved = Math.abs(readTop(root) - before) > 0.2;
    stalledFrames = moved ? 0 : distance <= 1 ? stalledFrames + 1 : 0;
    if (stalledFrames > MAX_STALLED_FRAMES && !bufferPending) { requestRoadAhead(true); if (stalledFrames > MAX_STALLED_FRAMES + 10 && !bufferPending) return void stopAutoScrollDown(); }
    continueNextFrame();
}

function shouldIgnoreHumanGesture(event) { return !!event?.target?.closest?.("#awtsmoosAutoScrollBtn, .typography-details, .sidebar, input, textarea, select, button, a"); }
function eventPoint(event) { const touch = event?.touches?.[0] || event?.changedTouches?.[0]; return { x: Number(touch?.clientX ?? event?.clientX ?? 0), y: Number(touch?.clientY ?? event?.clientY ?? 0) }; }
function beginGesture(event) { if (!scrollState.active || shouldIgnoreHumanGesture(event)) return; const point = eventPoint(event); const root = scrollRoot(); gesture = { x: point.x, y: point.y, scrollTop: readTop(root), paused: false }; clearResumeTimer(); }
function movementPastThreshold(event) { if (!gesture) return false; const point = eventPoint(event); const root = scrollRoot(); return Math.abs(point.y - gesture.y) >= TOUCH_MOVE_THRESHOLD || Math.abs(readTop(root) - gesture.scrollTop) >= SCROLL_MOVE_THRESHOLD; }
function pauseFromIntent() { if (!scrollState.active) return; if (gesture) gesture.paused = true; pauseAutoScrollDown(); }
function moveGesture(event) { if (scrollState.active && !shouldIgnoreHumanGesture(event) && gesture && movementPastThreshold(event)) pauseFromIntent(); }
function endGesture() { const shouldResume = !!gesture?.paused || scrollState.paused; gesture = null; if (shouldResume) scheduleAutoScrollResume(); }
function wheelGesture(event) { if (!scrollState.active || shouldIgnoreHumanGesture(event) || Math.abs(Number(event?.deltaY || 0)) < WHEEL_THRESHOLD) return; pauseAutoScrollDown(); scheduleAutoScrollResume(); }
function keyGesture(event) { if (!scrollState.active || shouldIgnoreHumanGesture(event) || !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) return; pauseAutoScrollDown(); scheduleAutoScrollResume(); }

function bindHumanPauseListeners() {
    if (scrollState.listenersBound || typeof document === "undefined") return;
    scrollState.listenersBound = true;
    const opts = { passive: true, capture: true };
    ["pointerdown", "touchstart"].forEach(type => document.addEventListener(type, beginGesture, opts));
    ["pointermove", "touchmove"].forEach(type => document.addEventListener(type, moveGesture, opts));
    ["pointerup", "pointercancel", "touchend", "touchcancel"].forEach(type => document.addEventListener(type, endGesture, opts));
    document.addEventListener("wheel", wheelGesture, opts);
    document.addEventListener("keydown", keyGesture, true);
}

export function setAutoScrollDownSpeed(value) { const speed = boundedSpeed(value); scrollState = { ...scrollState, speed }; writeSavedSpeed(speed); window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-speed", { detail: { speed } })); emitState(); return speed; }
export function loadAutoScrollDownSpeed() { return setAutoScrollDownSpeed(readSavedSpeed()); }
export function pauseAutoScrollDown() { if (!scrollState.active || scrollState.paused) return scrollState.active; clearResumeTimer(); scrollState = { ...scrollState, paused: true, resumeTimer: 0 }; document.body?.classList?.add("awtsmoos-auto-scroll-paused"); emitState(); return true; }
export function scheduleAutoScrollResume(delay = RESUME_DELAY_MS) { if (!scrollState.active) return false; clearResumeTimer(); scrollState.resumeTimer = setTimeout(() => { scrollState = { ...scrollState, paused: false, resumeTimer: 0 }; document.body?.classList?.remove("awtsmoos-auto-scroll-paused"); emitState(); }, delay); emitState(); return true; }

export function startAutoScrollDown(options = {}) {
    stopAutoScrollDown();
    bindHumanPauseListeners();
    scrollState = { ...scrollState, active: true, paused: false, raf: 0, resumeTimer: 0, speed: Number.isFinite(options.speed) ? boundedSpeed(options.speed) : readSavedSpeed() };
    gesture = null; bufferPending = false; stalledFrames = 0;
    writeSavedSpeed(scrollState.speed);
    requestRoadAhead(false);
    scrollState.raf = frame(step);
    document.body?.classList?.add("awtsmoos-auto-scroll-active");
    document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
    emitState();
    return true;
}

export function stopAutoScrollDown() { cancelFrame(scrollState.raf); clearResumeTimer(); gesture = null; bufferPending = false; stalledFrames = 0; scrollState = { ...scrollState, active: false, paused: false, raf: 0, resumeTimer: 0 }; document.body?.classList?.remove("awtsmoos-auto-scroll-active"); document.body?.classList?.remove("awtsmoos-auto-scroll-paused"); emitState(); return false; }
export function toggleAutoScrollDown(options = {}) { return scrollState.active ? stopAutoScrollDown() : startAutoScrollDown(options); }
export function getAutoScrollDownState() { return { active: scrollState.active, paused: scrollState.paused, speed: scrollState.speed }; }


