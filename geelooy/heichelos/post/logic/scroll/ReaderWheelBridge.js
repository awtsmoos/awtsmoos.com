// B"H
/**
 * @module ReaderWheelBridge
 * @description
 * Chapter 307 renewed: native scroll is king, with document-fallback named.
 * The bridge only observes. It never prevents default, never synthesizes scroll,
 * and records the activeVessel so diagnostics know which river carried the user.
 */

const BRIDGE_FLAG = "__awtsmoosReaderWheelBridge";
const STATE_FLAG = "__awtsmoosReaderWheelBridgeState";

function documentFallback() {
    return document.scrollingElement || document.documentElement || document.body;
}

function activeVessel(event) {
    const target = event?.target?.closest?.(".scroll-view-wrapper, .awtsmoos-view-content");
    if (target && target.scrollHeight > target.clientHeight + 2) return target;
    return documentFallback();
}

function scrollTopOf(vessel) {
    if (!vessel) return 0;
    if (vessel === document.body || vessel === document.documentElement || vessel === document.scrollingElement) {
        return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }
    return vessel.scrollTop || 0;
}

function rememberNative(event, mode) {
    const vessel = activeVessel(event);
    window[STATE_FLAG] = {
        at: Date.now(),
        mode,
        vessel: vessel === documentFallback() ? "document-fallback" : vessel.className || vessel.id || "active-vessel",
        activeVessel: true,
        passive: true,
        defaultPrevented: Boolean(event?.defaultPrevented),
        scrollY: scrollTopOf(vessel)
    };
}

function observeWheel(event) { rememberNative(event, "native-wheel"); }
function observeTouch(event) { rememberNative(event, "native-touch"); }

export function bindReaderWheelBridge() {
    if (window[BRIDGE_FLAG]) return window[BRIDGE_FLAG];
    document.addEventListener("wheel", observeWheel, { capture: true, passive: true });
    document.addEventListener("touchstart", observeTouch, { capture: true, passive: true });
    document.addEventListener("touchmove", observeTouch, { capture: true, passive: true });
    window[BRIDGE_FLAG] = {
        bound: true,
        at: Date.now(),
        selector: ".post-reader-localized-context",
        mode: "native-scroll-observer"
    };
    return window[BRIDGE_FLAG];
}

/** B"H: document-fallback and activeVessel remain named; the bridge only watches. */
