// B"H
/**
 * Chapter 190 test: the river flows, pauses beneath the human hand, resumes
 * after release, and still stops when commanded by the green button.
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
globalThis.window = {
    innerHeight: 100,
    dispatchEvent: () => true,
    addEventListener: () => {}
};
globalThis.CustomEvent = class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };
globalThis.document = {
    scrollingElement: { scrollTop: 0, scrollHeight: 500, clientHeight: 100 },
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

assert.equal(startAutoScrollDown({ speed: 3 }), true);
assert.equal(getAutoScrollDownState().active, true);
assert.equal(getAutoScrollDownState().paused, false);
assert.equal(getAutoScrollDownState().speed, 3);
assert.equal(classes.has("awtsmoos-auto-scroll-active"), true);
await new Promise(resolve => setTimeout(resolve, 5));
const moved = document.scrollingElement.scrollTop;
assert.ok(moved > 0);

pauseAutoScrollDown();
assert.equal(getAutoScrollDownState().paused, true);
assert.equal(classes.has("awtsmoos-auto-scroll-paused"), true);
await new Promise(resolve => setTimeout(resolve, 5));
assert.equal(document.scrollingElement.scrollTop, moved);

scheduleAutoScrollResume(1);
await new Promise(resolve => setTimeout(resolve, 8));
assert.equal(getAutoScrollDownState().paused, false);
assert.equal(classes.has("awtsmoos-auto-scroll-paused"), false);
await new Promise(resolve => setTimeout(resolve, 5));
assert.ok(document.scrollingElement.scrollTop > moved);

listeners.get("pointerdown")?.({ target: { closest: () => null } });
assert.equal(getAutoScrollDownState().paused, true);
listeners.get("pointerup")?.();
await new Promise(resolve => setTimeout(resolve, 700));
assert.equal(getAutoScrollDownState().paused, false);

assert.equal(toggleAutoScrollDown(), false);
assert.equal(getAutoScrollDownState().active, false);
assert.equal(classes.has("awtsmoos-auto-scroll-active"), false);
assert.equal(stopAutoScrollDown(), false);

console.log('B"H AutoScrollDown.test passed');
