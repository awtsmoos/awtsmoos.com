// B"H
/**
 * Chapter 193 test: the river ignores taps and tiny jitter, pauses only after a
 * meaningful manual scroll gesture, resumes after release, and still stops when
 * commanded by the green button.
 */
import assert from "node:assert/strict";
import {
    getAutoScrollDownState,
    pauseAutoScrollDown,
    scheduleAutoScrollResume,
    startAutoScrollDown,
    stopAutoScrollDown,
    toggleAutoScrollDown
} from "../AutoScrollDown.js";

const classes = new Set();
const listeners = new Map();
const scrollElement = { scrollTop: 0, scrollHeight: 900, clientHeight: 100 };

globalThis.window = {
    innerHeight: 100,
    dispatchEvent: () => true,
    addEventListener: () => {}
};
globalThis.CustomEvent = class CustomEvent {
    constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
};
globalThis.document = {
    scrollingElement: scrollElement,
    documentElement: null,
    querySelector: () => null,
    addEventListener: (type, handler) => listeners.set(type, handler),
    body: {
        classList: {
            add: name => classes.add(name),
            remove: name => classes.delete(name)
        }
    }
};
let rafId = 0;
globalThis.requestAnimationFrame = fn => {
    rafId += 1;
    setTimeout(() => fn(Date.now()), 0);
    return rafId;
};
globalThis.cancelAnimationFrame = () => {};

const target = { closest: () => null };

assert.equal(startAutoScrollDown({ speed: 3 }), true);
assert.equal(getAutoScrollDownState().active, true);
assert.equal(getAutoScrollDownState().paused, false);
assert.equal(getAutoScrollDownState().speed, 3);
assert.equal(classes.has("awtsmoos-auto-scroll-active"), true);
await new Promise(resolve => setTimeout(resolve, 5));
const moved = scrollElement.scrollTop;
assert.ok(moved > 0);

listeners.get("pointerdown")?.({ target, clientY: 100, clientX: 10 });
assert.equal(getAutoScrollDownState().paused, false, "mere touch must not pause");
listeners.get("pointermove")?.({ target, clientY: 112, clientX: 10 });
assert.equal(getAutoScrollDownState().paused, false, "tiny jitter must not pause");

listeners.get("pointermove")?.({ target, clientY: 142, clientX: 10 });
assert.equal(getAutoScrollDownState().paused, true, "real drag must pause");
const pausedAt = scrollElement.scrollTop;
await new Promise(resolve => setTimeout(resolve, 5));
assert.equal(scrollElement.scrollTop, pausedAt, "paused river must not move");

listeners.get("pointerup")?.();
await new Promise(resolve => setTimeout(resolve, 700));
assert.equal(getAutoScrollDownState().paused, false, "release resumes after delay");
await new Promise(resolve => setTimeout(resolve, 5));
assert.ok(scrollElement.scrollTop > pausedAt);

listeners.get("wheel")?.({ target, deltaY: 8 });
assert.equal(getAutoScrollDownState().paused, false, "tiny wheel must not pause");
listeners.get("wheel")?.({ target, deltaY: 44 });
assert.equal(getAutoScrollDownState().paused, true, "real wheel must pause");
scheduleAutoScrollResume(1);
await new Promise(resolve => setTimeout(resolve, 8));
assert.equal(getAutoScrollDownState().paused, false);

pauseAutoScrollDown();
assert.equal(getAutoScrollDownState().paused, true);
assert.equal(classes.has("awtsmoos-auto-scroll-paused"), true);
scheduleAutoScrollResume(1);
await new Promise(resolve => setTimeout(resolve, 8));
assert.equal(getAutoScrollDownState().paused, false);
assert.equal(classes.has("awtsmoos-auto-scroll-paused"), false);

assert.equal(toggleAutoScrollDown(), false);
assert.equal(getAutoScrollDownState().active, false);
assert.equal(classes.has("awtsmoos-auto-scroll-active"), false);
assert.equal(stopAutoScrollDown(), false);

console.log('B"H AutoScrollDown.test passed');
