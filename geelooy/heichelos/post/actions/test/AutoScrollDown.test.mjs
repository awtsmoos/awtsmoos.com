// B"H
import assert from "node:assert/strict";
import {
    getAutoScrollDownState,
    startAutoScrollDown,
    stopAutoScrollDown,
    toggleAutoScrollDown
} from "../AutoScrollDown.js";

const classes = new Set();
globalThis.window = { innerHeight: 100 };
globalThis.document = {
    scrollingElement: { scrollTop: 0, scrollHeight: 500 },
    documentElement: null,
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
assert.equal(getAutoScrollDownState().speed, 3);
assert.equal(classes.has("awtsmoos-auto-scroll-active"), true);
await new Promise(resolve => setTimeout(resolve, 5));
assert.ok(document.scrollingElement.scrollTop > 0);
assert.equal(toggleAutoScrollDown(), false);
assert.equal(getAutoScrollDownState().active, false);
assert.equal(classes.has("awtsmoos-auto-scroll-active"), false);
assert.equal(stopAutoScrollDown(), false);

console.log('B"H AutoScrollDown.test passed');
