// B"H
/**
 * @module AutoScrollDown
 * @description
 * Chapter 202: The reader's river was too slow, so the current now moves with
 * dignity. It still yields to human touch, requests more verses before the
 * bottom, and stops only after real exhaustion. The reader surface itself is not
 * remodeled; only the river's pace and patience are tuned.
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

function frame(callback) { return typeof requestAnimationFrame === "function" ? requestAnimationFrame(callback) : setTimeout(() => callback(Date.now()), 16); }
function cancelFrame(id) { if (!id) return; typeof cancelAnimationFrame === "function" ? cancelAnimationFrame(id) : clearTimeout(id); }
function clearResumeTimer() { if (scrollState.resumeTimer) clearTimeout(scrollState.resumeTimer); scrollState.resumeTimer = 0; }
function emitState() { window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-state", { detail: getAutoScrollDownState() })); }
function canScroll(element) { return element && element.scrollHeight > element.clientHeight + 2; }
function documentRoot() { return document.scrollingElement || document.documentElement || document.body; }

function scrollRoot() {
    const documentScroll = documentRoot();
    if (canScroll(documentScroll)) return documentScroll;
    const candidates = [document.querySelector?.(".scroll-view-wrapper"), document.querySelector?.("#realPost"), document.querySelector?.(".main")];
    return candidates.find(canScroll) || documentScroll;
}

function viewportHeight(root) { return root === documentRoot() ? window.innerHeight || root.clientHeight || 0 : root.clientHeight || window.innerHeight || 0; }
function bottomDistance(root) { return root.scrollHeight - (root.scrollTop + viewportHeight(root)); }
function boundedSpeed(value) { const parsed = Number.parseFloat(value); return Number.isFinite(parsed) ? Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsed)) : DEFAULT_SPEED; }
function readSavedSpeed() { try { return boundedSpeed(localStorage.getItem(SPEED_KEY) || DEFAULT_SPEED); } catch { return DEFAULT_SPEED; } }
function writeSavedSpeed(speed) { try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {} }

function requestRoadAhead(force = false) {
    if (bufferPending) return;
    bufferPending = true;
    Promise.resolve().then(async () => {
        try {
            const opened = await window.__awtsmoosAutoScrollVerseBuffer?.(1, { force, count: force ? 16 : 10 });
            if (opened) stalledFrames = 0;
        } catch (error) {
            console.warn("B\"H auto-scroll indexed buffer request resisted", error);
        } finally {
            bufferPending = false;
        }
    });
}

function continueNextFrame() { scrollState.raf = frame(step); }

function step() {
    if (!scrollState.active) return;
    if (scrollState.paused) return continueNextFrame();
    const root = scrollRoot();
    if (!root) return void stopAutoScrollDown();
    const before = root.scrollTop;
    const distance = bottomDistance(root);
    if (distance < BUFFER_DISTANCE) requestRoadAhead(false);
    if (distance < FORCE_DISTANCE) requestRoadAhead(true);
    root.scrollTop += scrollState.speed;
    const moved = Math.abs(root.scrollTop - before) > 0.2;
    if (moved) stalledFrames = 0;
    else if (distance <= 1) stalledFrames += 1;
    else stalledFrames = 0;
    if (stalledFrames > MAX_STALLED_FRAMES && !bufferPending) {
        requestRoadAhead(true);
        if (stalledFrames > MAX_STALLED_FRAMES + 10 && !bufferPending) return void stopAutoScrollDown();
    }
    continueNextFrame();
}

function shouldIgnoreHumanGesture(event) {
    return !!event?.target?.closest?.("#awtsmoosAutoScrollBtn, .typography-details, .sidebar, input, textarea, select, button, a");
}

function eventPoint(event) {
    const touch = event?.touches?.[0] || event?.changedTouches?.[0];
    return { x: Number(touch?.clientX ?? event?.clientX ?? 0), y: Number(touch?.clientY ?? event?.clientY ?? 0) };
}

function beginGesture(event) {
    if (!scrollState.active || shouldIgnoreHumanGesture(event)) return;
    const point = eventPoint(event);
    const root = scrollRoot();
    gesture = { x: point.x, y: point.y, scrollTop: root?.scrollTop || 0, paused: false };
    clearResumeTimer();
}

function movementPastThreshold(event) {
    if (!gesture) return false;
    const point = eventPoint(event);
    const root = scrollRoot();
    return Math.abs(point.y - gesture.y) >= TOUCH_MOVE_THRESHOLD || Math.abs((root?.scrollTop || 0) - gesture.scrollTop) >= SCROLL_MOVE_THRESHOLD;
}

function pauseFromIntent() { if (!scrollState.active) return; if (gesture) gesture.paused = true; pauseAutoScrollDown(); }
function moveGesture(event) { if (scrollState.active && !shouldIgnoreHumanGesture(event) && gesture && movementPastThreshold(event)) pauseFromIntent(); }
function endGesture() { const shouldResume = !!gesture?.paused || scrollState.paused; gesture = null; if (shouldResume) scheduleAutoScrollResume(); }
function wheelGesture(event) { if (!scrollState.active || shouldIgnoreHumanGesture(event) || Math.abs(Number(event?.deltaY || 0)) < WHEEL_THRESHOLD) return; pauseAutoScrollDown(); scheduleAutoScrollResume(); }
function keyGesture(event) { if (!scrollState.active || shouldIgnoreHumanGesture(event) || !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) return; pauseAutoScrollDown(); scheduleAutoScrollResume(); }

function bindHumanPauseListeners() {
    if (scrollState.listenersBound || typeof document === "undefined") return;
    scrollState.listenersBound = true;
    const opts = { passive: true, capture: true };
    document.addEventListener("pointerdown", beginGesture, opts);
    document.addEventListener("pointermove", moveGesture, opts);
    document.addEventListener("pointerup", endGesture, opts);
    document.addEventListener("pointercancel", endGesture, opts);
    document.addEventListener("touchstart", beginGesture, opts);
    document.addEventListener("touchmove", moveGesture, opts);
    document.addEventListener("touchend", endGesture, opts);
    document.addEventListener("touchcancel", endGesture, opts);
    document.addEventListener("wheel", wheelGesture, opts);
    document.addEventListener("keydown", keyGesture, true);
}

export function setAutoScrollDownSpeed(value) {
    const speed = boundedSpeed(value);
    scrollState = { ...scrollState, speed };
    writeSavedSpeed(speed);
    window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-speed", { detail: { speed } }));
    emitState();
    return speed;
}

export function loadAutoScrollDownSpeed() { return setAutoScrollDownSpeed(readSavedSpeed()); }

export function pauseAutoScrollDown() {
    if (!scrollState.active || scrollState.paused) return scrollState.active;
    clearResumeTimer();
    scrollState = { ...scrollState, paused: true, resumeTimer: 0 };
    document.body?.classList?.add("awtsmoos-auto-scroll-paused");
    emitState();
    return true;
}

export function scheduleAutoScrollResume(delay = RESUME_DELAY_MS) {
    if (!scrollState.active) return false;
    clearResumeTimer();
    scrollState.resumeTimer = setTimeout(() => {
        scrollState = { ...scrollState, paused: false, resumeTimer: 0 };
        document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
        emitState();
    }, delay);
    emitState();
    return true;
}

export function startAutoScrollDown(options = {}) {
    stopAutoScrollDown();
    bindHumanPauseListeners();
    scrollState = { ...scrollState, active: true, paused: false, raf: 0, resumeTimer: 0, speed: Number.isFinite(options.speed) ? boundedSpeed(options.speed) : readSavedSpeed() };
    gesture = null;
    bufferPending = false;
    stalledFrames = 0;
    writeSavedSpeed(scrollState.speed);
    requestRoadAhead(false);
    scrollState.raf = frame(step);
    document.body?.classList?.add("awtsmoos-auto-scroll-active");
    document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
    emitState();
    return true;
}

export function stopAutoScrollDown() {
    cancelFrame(scrollState.raf);
    clearResumeTimer();
    gesture = null;
    bufferPending = false;
    stalledFrames = 0;
    scrollState = { ...scrollState, active: false, paused: false, raf: 0, resumeTimer: 0 };
    document.body?.classList?.remove("awtsmoos-auto-scroll-active");
    document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
    emitState();
    return false;
}

export function toggleAutoScrollDown(options = {}) { return scrollState.active ? stopAutoScrollDown() : startAutoScrollDown(options); }
export function getAutoScrollDownState() { return { active: scrollState.active, paused: scrollState.paused, speed: scrollState.speed }; }
