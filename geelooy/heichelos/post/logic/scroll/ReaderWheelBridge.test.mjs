// B"H
/**
 * Chapter 309: the wheel bridge no longer steals the river.
 * It binds passive observers only. Native browser scroll remains responsible
 * for movement over the main reader body and mobile touch surface.
 */
import assert from "node:assert/strict";

const listeners = new Map();
const documentElement = { scrollTop: 0, scrollHeight: 2000, clientHeight: 500 };
const body = { scrollTop: 0, scrollHeight: 2000, clientHeight: 500 };

globalThis.window = {
    innerHeight: 500,
    scrollY: 0,
    __awtsmoosReaderWheelBridge: null,
    __awtsmoosReaderWheelBridgeState: null
};

globalThis.document = {
    scrollingElement: documentElement,
    documentElement,
    body,
    addEventListener(type, handler, options) {
        listeners.set(type, { handler, options });
    }
};

const { bindReaderWheelBridge } = await import("./ReaderWheelBridge.js");
const state = bindReaderWheelBridge();
assert.equal(state.bound, true);
assert.equal(state.mode, "native-scroll-observer");
assert.equal(listeners.get("wheel").options.passive, true);
assert.equal(listeners.get("touchmove").options.passive, true);

let prevented = false;
listeners.get("wheel").handler({ defaultPrevented: false, preventDefault: () => { prevented = true; } });
assert.equal(prevented, false);
assert.equal(window.scrollY, 0);
assert.equal(window.__awtsmoosReaderWheelBridgeState.mode, "native-wheel");
assert.equal(window.__awtsmoosReaderWheelBridgeState.passive, true);

listeners.get("touchmove").handler({ defaultPrevented: false, preventDefault: () => { prevented = true; } });
assert.equal(prevented, false);
assert.equal(window.__awtsmoosReaderWheelBridgeState.mode, "native-touch");
console.log('B"H ReaderWheelBridge.test passed');
