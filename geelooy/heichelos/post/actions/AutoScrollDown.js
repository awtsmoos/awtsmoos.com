// B"H
/**
 * @module AutoScrollDown
 * @description
 * Chapter 145: The green river receives a throttle of will.
 * The Awtsmoos lets the reader choose the river-speed from the A-menu. The
 * speed persists, updates mid-flight, and flows through the true scroll-root.
 */

const DEFAULT_SPEED = 1.15;
const MIN_SPEED = 0.25;
const MAX_SPEED = 8;
const SPEED_KEY = "awtsmoos-auto-scroll-speed";

let scrollState = { active: false, raf: 0, speed: readSavedSpeed() };

function frame(callback) {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
    return setTimeout(() => callback(Date.now()), 16);
}

function cancelFrame(id) {
    if (!id) return;
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id);
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
    try {
        return boundedSpeed(localStorage.getItem(SPEED_KEY) || DEFAULT_SPEED);
    } catch {
        return DEFAULT_SPEED;
    }
}

function writeSavedSpeed(speed) {
    try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {}
}

function step() {
    if (!scrollState.active) return;
    const root = scrollRoot();
    if (!root || atBottom(root)) {
        stopAutoScrollDown();
        return;
    }
    root.scrollTop += scrollState.speed;
    scrollState.raf = frame(step);
}

/**
 * Sets the automatic scroll speed.
 * @param {number|string} value Pixels per animation frame.
 * @returns {number} The bounded speed.
 */
export function setAutoScrollDownSpeed(value) {
    const speed = boundedSpeed(value);
    scrollState = { ...scrollState, speed };
    writeSavedSpeed(speed);
    window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-speed", { detail: { speed } }));
    return speed;
}

/** Loads speed from memory and returns it. */
export function loadAutoScrollDownSpeed() {
    return setAutoScrollDownSpeed(readSavedSpeed());
}

/** Starts smooth automatic downward reading. */
export function startAutoScrollDown(options = {}) {
    stopAutoScrollDown();
    scrollState = {
        active: true,
        raf: 0,
        speed: Number.isFinite(options.speed) ? boundedSpeed(options.speed) : readSavedSpeed()
    };
    writeSavedSpeed(scrollState.speed);
    scrollState.raf = frame(step);
    document.body?.classList?.add("awtsmoos-auto-scroll-active");
    return true;
}

/** Stops the automatic descent. */
export function stopAutoScrollDown() {
    cancelFrame(scrollState.raf);
    scrollState = { ...scrollState, active: false, raf: 0 };
    document.body?.classList?.remove("awtsmoos-auto-scroll-active");
    return false;
}

/** Toggles automatic downward reading. */
export function toggleAutoScrollDown(options = {}) {
    return scrollState.active ? stopAutoScrollDown() : startAutoScrollDown(options);
}

/** Exposes the current state for UI labels and tests. */
export function getAutoScrollDownState() {
    return { active: scrollState.active, speed: scrollState.speed };
}
