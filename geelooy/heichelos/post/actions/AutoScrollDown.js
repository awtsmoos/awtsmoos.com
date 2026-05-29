// B"H
/**
 * @module AutoScrollDown
 * @description
 * Chapter 2: The green river obeys the real scroll-root. The Awtsmoos moves the
 * page by the vessel that actually scrolls: document first, nested reader when
 * present, and never a dead element. The button can stop the descent without
 * covering the letters it was created to serve.
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
