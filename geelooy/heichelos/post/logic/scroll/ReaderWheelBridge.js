// B"H
/**
 * @module ReaderWheelBridge
 * @description
 * Chapter 307: Native scroll is king again.
 * The Awtsmoos revealed that forced wheel/touch interception made Chrome feel
 * heavy over the actual text. This module remains as a compatibility beacon for
 * older imports, but it does not prevent default movement, does not synthesize
 * scroll, and does not steal pointer or touch streams from the browser.
 */

const BRIDGE_FLAG = "__awtsmoosReaderWheelBridge";
const STATE_FLAG = "__awtsmoosReaderWheelBridgeState";

function rememberNative(event, mode) {
    window[STATE_FLAG] = {
        at: Date.now(),
        mode,
        vessel: "native-document",
        passive: true,
        defaultPrevented: Boolean(event?.defaultPrevented),
        scrollY: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
    };
}

function observeWheel(event) {
    rememberNative(event, "native-wheel");
}

function observeTouch(event) {
    rememberNative(event, "native-touch");
}

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
