// B"H
/**
 * @module AutoScrollDown
 * @description
 * Chapter 190: The green river bows to the human hand.
 * Auto-scroll flows by itself, but the instant a finger, wheel, key, or pointer
 * touches the scroll, the river pauses without forgetting its covenant. When
 * the reader releases the page, the stream resumes after a tiny breath. The
 * button receives live state events so it can say Scroll, Stop, or Paused.
 */

const DEFAULT_SPEED = 1.15;
const MIN_SPEED = 0.25;
const MAX_SPEED = 8;
const SPEED_KEY = "awtsmoos-auto-scroll-speed";
const RESUME_DELAY_MS = 650;

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

function shouldIgnorePause(event) {
    return !!event?.target?.closest?.("#awtsmoosAutoScrollBtn, .typography-details, .sidebar");
}

function pauseFromHuman(event) {
    if (!scrollState.active || shouldIgnorePause(event)) return;
    pauseAutoScrollDown();
}

function resumeFromHuman() {
    if (!scrollState.active) return;
    scheduleAutoScrollResume();
}

function bindHumanPauseListeners() {
    if (scrollState.listenersBound || typeof document === "undefined") return;
    scrollState.listenersBound = true;
    const opts = { passive: true, capture: true };
    document.addEventListener("pointerdown", pauseFromHuman, opts);
    document.addEventListener("pointermove", pauseFromHuman, opts);
    document.addEventListener("pointerup", resumeFromHuman, opts);
    document.addEventListener("pointercancel", resumeFromHuman, opts);
    document.addEventListener("touchstart", pauseFromHuman, opts);
    document.addEventListener("touchmove", pauseFromHuman, opts);
    document.addEventListener("touchend", resumeFromHuman, opts);
    document.addEventListener("touchcancel", resumeFromHuman, opts);
    document.addEventListener("wheel", event => {
        pauseFromHuman(event);
        resumeFromHuman();
    }, opts);
    document.addEventListener("keydown", event => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
            pauseFromHuman(event);
            resumeFromHuman();
        }
    }, true);
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

/** Schedules the river to resume after the hand leaves the screen. */
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
