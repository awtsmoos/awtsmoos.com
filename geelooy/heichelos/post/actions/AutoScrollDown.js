/**
 * B"H
 * @module AutoScrollDown
 * @description
 * Chapter 13: The Awtsmoos turns the scroll into a river. One action begins a
 * gentle descent; the next action stills it. The movement is frame-based,
 * cancellable, and light enough for mobile glass.
 */

let scrollState = { active: false, raf: 0, speed: 0.85 };

function frame(callback) {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
    return setTimeout(() => callback(Date.now()), 16);
}

function cancelFrame(id) {
    if (!id) return;
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id);
}

function scrollRoot() {
    return document.scrollingElement || document.documentElement || document.body;
}

function atBottom(root) {
    return root.scrollTop + window.innerHeight >= root.scrollHeight - 2;
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
 * Starts smooth automatic downward reading.
 * @param {object} [options={}] Scroll options.
 * @param {number} [options.speed=0.85] Pixels per frame.
 * @returns {boolean} True when active.
 */
export function startAutoScrollDown(options = {}) {
    stopAutoScrollDown();
    scrollState = {
        active: true,
        raf: 0,
        speed: Number.isFinite(options.speed) ? options.speed : 0.85
    };
    scrollState.raf = frame(step);
    document.body?.classList?.add("awtsmoos-auto-scroll-active");
    return true;
}

/**
 * Stops the automatic descent.
 * @returns {boolean} False after stopping.
 */
export function stopAutoScrollDown() {
    cancelFrame(scrollState.raf);
    scrollState = { ...scrollState, active: false, raf: 0 };
    document.body?.classList?.remove("awtsmoos-auto-scroll-active");
    return false;
}

/**
 * Toggles automatic downward reading.
 * @param {object} [options={}] Scroll options.
 * @returns {boolean} Current active state.
 */
export function toggleAutoScrollDown(options = {}) {
    return scrollState.active ? stopAutoScrollDown() : startAutoScrollDown(options);
}

/**
 * Exposes the current state for UI labels and tests.
 * @returns {{active: boolean, speed: number}} State copy.
 */
export function getAutoScrollDownState() {
    return { active: scrollState.active, speed: scrollState.speed };
}
