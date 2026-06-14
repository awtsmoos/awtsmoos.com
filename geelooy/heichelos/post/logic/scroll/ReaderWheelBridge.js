// B"H
/**
 * @module ReaderWheelBridge
 * @description
 * Chapter 306: The page itself answers wheel and finger.
 * The Awtsmoos watched desktop motion die except on the scrollbar gutter and
 * mobile touch refuse the river. This bridge now carries wheel and touch deltas
 * from reader content into the real scroll vessel while leaving buttons,
 * sidebars, inputs, links, and panels alone.
 */

const BRIDGE_FLAG = "__awtsmoosReaderWheelBridge";
const WRAPPER_SELECTOR = ".scroll-view-wrapper";
const READER_SELECTOR = ".post-reader-localized-context";
const IGNORED_SELECTOR = [
    ".sidebar",
    ".typography-details",
    ".awtsmoos-floating-controls",
    "#command-palette-container",
    "#custom-context-menu",
    "input",
    "textarea",
    "select",
    "button",
    "a",
    "summary",
    "[contenteditable='true']",
    "[role='button']"
].join(", ");

let touchPoint = null;

function documentRoot() {
    return document.scrollingElement || document.documentElement || document.body;
}

function canScrollElement(node) {
    return !!node && node.scrollHeight > node.clientHeight + 2;
}

function activeVessel() {
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    return canScrollElement(wrapper) ? wrapper : documentRoot();
}

function readTop(vessel) {
    return vessel === documentRoot() ? window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0 : vessel.scrollTop;
}

function writeTop(vessel, top) {
    const safe = Math.max(0, Math.min(maxTop(vessel), top));
    if (vessel === documentRoot()) window.scrollTo({ top: safe, behavior: "auto" });
    else vessel.scrollTop = safe;
}

function maxTop(vessel) {
    if (vessel === documentRoot()) {
        const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        return Math.max(0, height - (window.innerHeight || document.documentElement.clientHeight || 0));
    }
    return Math.max(0, vessel.scrollHeight - vessel.clientHeight);
}

function insideReader(target) {
    const reader = document.querySelector(READER_SELECTOR);
    if (!reader || !target) return false;
    return reader.contains(target) || target === document.body || target === document.documentElement;
}

function shouldBridge(target) {
    if (!insideReader(target)) return false;
    if (target.closest?.(IGNORED_SELECTOR)) return false;
    return maxTop(activeVessel()) > 2;
}

function remember(vessel, deltaY, before, mode) {
    window.__awtsmoosReaderWheelBridgeState = {
        at: Date.now(),
        mode,
        vessel: vessel === documentRoot() ? "document" : "wrapper",
        before,
        after: readTop(vessel),
        deltaY,
        moved: Math.abs(readTop(vessel) - before) > 0.1
    };
}

function moveBy(deltaY, deltaX = 0, mode = "wheel") {
    const vessel = activeVessel();
    const before = readTop(vessel);
    writeTop(vessel, before + deltaY);
    if (vessel !== documentRoot()) vessel.scrollLeft += deltaX;
    remember(vessel, deltaY, before, mode);
    return Math.abs(readTop(vessel) - before) > 0.1;
}

function bridgeWheel(event) {
    if (!shouldBridge(event?.target)) return;
    const unit = event.deltaMode === 1 ? 38 : event.deltaMode === 2 ? window.innerHeight : 1;
    if (moveBy(event.deltaY * unit, event.deltaX * unit, "wheel")) event.preventDefault();
}

function bridgeTouchStart(event) {
    if (!shouldBridge(event?.target)) return void (touchPoint = null);
    const touch = event.touches?.[0];
    touchPoint = touch ? { x: touch.clientX, y: touch.clientY, target: event.target } : null;
}

function bridgeTouchMove(event) {
    const touch = event.touches?.[0];
    if (!touchPoint || !touch || !shouldBridge(touchPoint.target)) return;
    const deltaY = touchPoint.y - touch.clientY;
    const deltaX = touchPoint.x - touch.clientX;
    touchPoint = { x: touch.clientX, y: touch.clientY, target: touchPoint.target };
    if (moveBy(deltaY, deltaX, "touch")) event.preventDefault();
}

export function bindReaderWheelBridge() {
    if (window[BRIDGE_FLAG]) return window[BRIDGE_FLAG];
    document.addEventListener("wheel", bridgeWheel, { capture: true, passive: false });
    document.addEventListener("touchstart", bridgeTouchStart, { capture: true, passive: true });
    document.addEventListener("touchmove", bridgeTouchMove, { capture: true, passive: false });
    window[BRIDGE_FLAG] = { bound: true, at: Date.now(), selector: READER_SELECTOR, mode: "wheel-and-touch" };
    return window[BRIDGE_FLAG];
}
