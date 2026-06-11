// B"H
/**
 * Chapter 305: the wheel bridge lets verse content carry motion into either
 * the wrapper or, when the page is the real river, the document itself.
 */
import assert from "node:assert/strict";

const listeners = new Map();
const wrapper = { scrollTop: 0, scrollLeft: 0, scrollHeight: 500, clientHeight: 500 };
const documentElement = { scrollTop: 0, scrollHeight: 2000, clientHeight: 500 };
const body = { scrollTop: 0, scrollHeight: 2000, clientHeight: 500 };

globalThis.window = {
    innerHeight: 500,
    scrollY: 0,
    __awtsmoosReaderWheelBridge: null,
    __awtsmoosReaderWheelBridgeState: null,
    scrollTo({ top }) { this.scrollY = top; documentElement.scrollTop = top; }
};

const reader = { contains: target => target?.inside === true };

globalThis.document = {
    scrollingElement: documentElement,
    documentElement,
    body,
    querySelector(selector) {
        if (selector === ".scroll-view-wrapper") return wrapper;
        if (selector === ".post-reader-localized-context") return reader;
        return null;
    },
    addEventListener: (type, handler) => listeners.set(type, handler)
};

const { bindReaderWheelBridge } = await import("./ReaderWheelBridge.js");
assert.equal(bindReaderWheelBridge().bound, true);

const verseTarget = { inside: true, closest: () => null };
let prevented = false;
listeners.get("wheel")({ target: verseTarget, deltaX: 0, deltaY: 120, deltaMode: 0, preventDefault: () => { prevented = true; } });
assert.equal(window.scrollY, 120);
assert.equal(prevented, true);
assert.equal(window.__awtsmoosReaderWheelBridgeState.vessel, "document");
assert.equal(window.__awtsmoosReaderWheelBridgeState.moved, true);

const controlTarget = { inside: true, closest: selector => selector.includes("button") ? {} : null };
listeners.get("wheel")({ target: controlTarget, deltaX: 0, deltaY: 120, deltaMode: 0, preventDefault: () => { throw new Error("control wheel should not be captured"); } });
assert.equal(window.scrollY, 120);
console.log('B"H ReaderWheelBridge.test passed');
