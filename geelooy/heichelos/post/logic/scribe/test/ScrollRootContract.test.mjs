// B"H
/**
 * Chapter 285: The virtual reader must follow whichever vessel really scrolls.
 * This test simulates the broken post view: document reports height but the
 * fixed reader shell makes the internal scroll wrapper the only real river.
 */
import assert from "node:assert/strict";

const inner = {
    tagName: "DIV",
    id: "readerScroller",
    className: "scroll-view-wrapper",
    scrollHeight: 4000,
    clientHeight: 700,
    scrollTop: 120,
    listeners: {},
    addEventListener(name, handler) { this.listeners[name] = handler; },
    removeEventListener(name) { delete this.listeners[name]; },
    getBoundingClientRect() { return { top: 25 }; }
};

const shell = { tagName: "DIV", className: "post-reader-localized-context", scrollHeight: 700, clientHeight: 700, scrollTop: 0 };
const documentElement = { tagName: "HTML", scrollHeight: 9000, clientHeight: 900, scrollTop: 0 };
const body = { tagName: "BODY", scrollHeight: 9000, clientHeight: 900, scrollTop: 0 };

globalThis.window = {
    innerHeight: 700,
    scrollY: 0,
    events: {},
    addEventListener(name, handler) { this.events[name] = handler; },
    removeEventListener(name) { delete this.events[name]; },
    scrollTo({ top }) { this.scrollY = top; documentElement.scrollTop = top; }
};

globalThis.getComputedStyle = node => ({
    position: node === shell ? "fixed" : "static",
    overflowY: node === inner ? "auto" : "hidden",
    overflow: node === inner ? "auto" : "hidden"
});

globalThis.document = {
    documentElement,
    body,
    scrollingElement: documentElement,
    querySelector(selector) {
        if (selector === ".scroll-view-wrapper") return inner;
        if (selector === ".post-reader-localized-context") return shell;
        return null;
    }
};

const mod = await import("../VirtualScrollRoot.js");
assert.equal(mod.scrollRoot(), inner);
assert.equal(mod.scrollTopOf(), 120);
assert.equal(mod.bottomDistanceOf(), 3180);
mod.setScrollTop(inner, 444);
assert.equal(inner.scrollTop, 444);
const off = mod.addRootScrollListener(() => {});
assert.equal(typeof inner.listeners.scroll, "function");
assert.equal(typeof window.events.wheel, "function");
assert.equal(typeof window.events.keydown, "function");
off();
assert.equal(inner.listeners.scroll, undefined);
assert.equal(window.events.wheel, undefined);
assert.equal(window.events.keydown, undefined);
console.log('B"H ScrollRootContract.test passed');
