// B"H
/**
 * @module ReaderWheelBridge
 * @description
 * Chapter 302: The wheel over the letters now moves the page itself.
 * If a nested verse/card consumes wheel events, this bridge catches the delta in
 * capture phase and applies it to the active scroll vessel: first the wrapper if
 * it truly scrolls, otherwise the document river. Controls and side panels are
 * not captured.
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
    const safe = Math.max(0, top);
    if (vessel === documentRoot()) window.scrollTo({ top: safe, behavior: "auto" });
    else vessel.scrollTop = safe;
}

function maxTop(vessel) {
    if (vessel === documentRoot()) {
        return Math.max(0, Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight);
    }
    return Math.max(0, vessel.scrollHeight - vessel.clientHeight);
}

function deltaPixels(event) {
    const unit = event.deltaMode === 1 ? 38 : event.deltaMode === 2 ? window.innerHeight : 1;
    return { x: event.deltaX * unit, y: event.deltaY * unit };
}

function shouldBridge(event) {
    const reader = document.querySelector(READER_SELECTOR);
    if (!reader || !event?.target) return false;
    if (!reader.contains(event.target)) return false;
    if (event.target.closest?.(IGNORED_SELECTOR)) return false;
    return maxTop(activeVessel()) > 2;
}

function remember(vessel, delta, before) {
    window.__awtsmoosReaderWheelBridgeState = {
        at: Date.now(),
        vessel: vessel === documentRoot() ? "document" : "wrapper",
        before,
        after: readTop(vessel),
        deltaY: delta.y,
        moved: Math.abs(readTop(vessel) - before) > 0.1
    };
}

function bridgeWheel(event) {
    if (!shouldBridge(event)) return;
    const vessel = activeVessel();
    const before = readTop(vessel);
    const delta = deltaPixels(event);
    writeTop(vessel, Math.min(maxTop(vessel), before + delta.y));
    if (vessel !== documentRoot()) vessel.scrollLeft += delta.x;
    remember(vessel, delta, before);
    if (Math.abs(readTop(vessel) - before) > 0.1) event.preventDefault();
}

export function bindReaderWheelBridge() {
    if (window[BRIDGE_FLAG]) return window[BRIDGE_FLAG];
    const options = { capture: true, passive: false };
    document.addEventListener("wheel", bridgeWheel, options);
    window[BRIDGE_FLAG] = { bound: true, at: Date.now(), selector: READER_SELECTOR, mode: "document-fallback" };
    return window[BRIDGE_FLAG];
}
