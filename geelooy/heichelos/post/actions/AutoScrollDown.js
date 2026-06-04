// B"H
/**
 * @module AutoScrollDown
 * @description
 * Chapter 193: The river now distinguishes touch from intent.
 * The Awtsmoos keeps the auto-scroll flowing when a finger merely rests, taps,
 * or jitters on glass. Only a real manual scroll gesture past the threshold
 * pauses the river, lets the reader pull away, and then resumes after release.
 */

const DEFAULT_SPEED = 1.15;
const MIN_SPEED = 0.25;
const MAX_SPEED = 8;
const SPEED_KEY = "awtsmoos-auto-scroll-speed";
const RESUME_DELAY_MS = 650;
const TOUCH_MOVE_THRESHOLD = 26;
const SCROLL_MOVE_THRESHOLD = 18;
const WHEEL_THRESHOLD = 32;

let gesture = null;
let scrollState = {
    active: false,
    paused: false,
    raf: 0,
    resumeTimer: 0,
    listenersBound: false,
    speed: readSavedSpeed()
};

function frame(callback) {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
    return setTimeout(() => callback(Date.now()), 16);
}

function cancelFrame(id) {
    if (!id) return;
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id);
}

function clearResumeTimer() {
    if (!scrollState.resumeTimer) return;
    clearTimeout(scrollState.resumeTimer);
    scrollState.resumeTimer = 0;
}

function emitState() {
    window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-state", { detail: getAutoScrollDownState() }));
}

function canScroll(element) {
    return element && element.scrollHeight > element.clientHeight + 2;
}

function documentRoot() {
    return document.scrollingElement || document.documentElement || document.body;
}

function scrollRoot() {
    const documentScroll = documentRoot();
    if (canScroll(documentScroll)) return documentScroll;
    const candidates = [
        document.querySelector?.(".scroll-view-wrapper"),
        document.querySelector?.("#realPost"),
        document.querySelector?.(".main")
    ];
    return candidates.find(canScroll) || documentScroll;
}

function viewportHeight(root) {
    if (root === documentRoot()) return window.innerHeight || root.clientHeight || 0;
    return root.clientHeight || window.innerHeight || 0;
}

function atBottom(root) {
    return root.scrollTop + viewportHeight(root) >= root.scrollHeight - 2;
}

function boundedSpeed(value) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return DEFAULT_SPEED;
    return Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsed));
}

function readSavedSpeed() {
    try { return boundedSpeed(localStorage.getItem(SPEED_KEY) || DEFAULT_SPEED); }
    catch { return DEFAULT_SPEED; }
}

function writeSavedSpeed(speed) {
    try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {}
}

function step() {
    if (!scrollState.active) return;
    if (scrollState.paused) {
        scrollState.raf = frame(step);
        return;
    }
    const root = scrollRoot();
    if (!root || atBottom(root)) {
        stopAutoScrollDown();
        return;
    }
    root.scrollTop += scrollState.speed;
    scrollState.raf = frame(step);
}

function shouldIgnoreHumanGesture(event) {
    return !!event?.target?.closest?.("#awtsmoosAutoScrollBtn, .typography-details, .sidebar, input, textarea, select, button, a");
}

function eventPoint(event) {
    const touch = event?.touches?.[0] || event?.changedTouches?.[0];
    return {
        x: Number(touch?.clientX ?? event?.clientX ?? 0),
        y: Number(touch?.clientY ?? event?.clientY ?? 0)
    };
}

function beginGesture(event) {
    if (!scrollState.active || shouldIgnoreHumanGesture(event)) return;
    const point = eventPoint(event);
    const root = scrollRoot();
    gesture = {
        x: point.x,
        y: point.y,
        scrollTop: root?.scrollTop || 0,
        ignored: false,
        paused: false
    };
    clearResumeTimer();
}

function movementPastThreshold(event) {
    if (!gesture) return false;
    const point = eventPoint(event);
    const root = scrollRoot();
    const fingerDistance = Math.abs(point.y - gesture.y);
    const scrollDistance = Math.abs((root?.scrollTop || 0) - gesture.scrollTop);
    return fingerDistance >= TOUCH_MOVE_THRESHOLD || scrollDistance >= SCROLL_MOVE_THRESHOLD;
}

function pauseFromIntent() {
    if (!scrollState.active) return;
    if (gesture) gesture.paused = true;
    pauseAutoScrollDown();
}

function moveGesture(event) {
    if (!scrollState.active || shouldIgnoreHumanGesture(event) || !gesture) return;
    if (movementPastThreshold(event)) pauseFromIntent();
}

function endGesture() {
    const shouldResume = !!gesture?.paused || scrollState.paused;
    gesture = null;
    if (shouldResume) scheduleAutoScrollResume();
}

function wheelGesture(event) {
    if (!scrollState.active || shouldIgnoreHumanGesture(event)) return;
    if (Math.abs(Number(event?.deltaY || 0)) < WHEEL_THRESHOLD) return;
    pauseAutoScrollDown();
    scheduleAutoScrollResume();
}

function keyGesture(event) {
    if (!scrollState.active || shouldIgnoreHumanGesture(event)) return;
    if (!["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) return;
    pauseAutoScrollDown();
    scheduleAutoScrollResume();
}

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

/** Sets the automatic scroll speed. */
export function setAutoScrollDownSpeed(value) {
    const speed = boundedSpeed(value);
    scrollState = { ...scrollState, speed };
    writeSavedSpeed(speed);
    window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-speed", { detail: { speed } }));
    emitState();
    return speed;
}

/** Loads speed from memory and returns it. */
export function loadAutoScrollDownSpeed() {
    return setAutoScrollDownSpeed(readSavedSpeed());
}

/** Pauses the automatic descent without turning it off. */
export function pauseAutoScrollDown() {
    if (!scrollState.active || scrollState.paused) return scrollState.active;
    clearResumeTimer();
    scrollState = { ...scrollState, paused: true, resumeTimer: 0 };
    document.body?.classList?.add("awtsmoos-auto-scroll-paused");
    emitState();
    return true;
}

/** Schedules the river to resume after the human stops steering. */
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

/** Starts smooth automatic downward reading. */
export function startAutoScrollDown(options = {}) {
    stopAutoScrollDown();
    bindHumanPauseListeners();
    scrollState = {
        ...scrollState,
        active: true,
        paused: false,
        raf: 0,
        resumeTimer: 0,
        speed: Number.isFinite(options.speed) ? boundedSpeed(options.speed) : readSavedSpeed()
    };
    gesture = null;
    writeSavedSpeed(scrollState.speed);
    scrollState.raf = frame(step);
    document.body?.classList?.add("awtsmoos-auto-scroll-active");
    document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
    emitState();
    return true;
}

/** Stops the automatic descent entirely. */
export function stopAutoScrollDown() {
    cancelFrame(scrollState.raf);
    clearResumeTimer();
    gesture = null;
    scrollState = { ...scrollState, active: false, paused: false, raf: 0, resumeTimer: 0 };
    document.body?.classList?.remove("awtsmoos-auto-scroll-active");
    document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
    emitState();
    return false;
}

/** Toggles automatic downward reading. */
export function toggleAutoScrollDown(options = {}) {
    return scrollState.active ? stopAutoScrollDown() : startAutoScrollDown(options);
}

/** Exposes the current state for UI labels and tests. */
export function getAutoScrollDownState() {
    return { active: scrollState.active, paused: scrollState.paused, speed: scrollState.speed };
}
