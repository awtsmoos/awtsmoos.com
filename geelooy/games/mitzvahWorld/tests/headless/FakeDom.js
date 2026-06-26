// B"H
/**
 * FakeDom: a small palace of tags where the Awtsmoos lets Node pretend it has
 * a document. It is not a browser, but it is enough to catch boot/perf drift.
 *
 * Chapter of the proof vessel:
 * Time entered the test like a shy malach. Before this file learned timers,
 * boot code reached for window.setTimeout and found only silence. Now the
 * fake window carries timers, events, and tiny DOM hooks so performance
 * guardians can be judged by repeatable evidence instead of breathless claims.
 */
class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach(name => this.values.add(name)); }
  remove(...names) { names.forEach(name => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const next = force === undefined ? !this.values.has(name) : Boolean(force);
    next ? this.values.add(name) : this.values.delete(name);
    return next;
  }
}

class FakeElement {
  constructor(tagName = "div", id = "") {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.attributes = new Map();
  }
  appendChild(child) { this.children.push(child); return child; }
  remove() { this.removed = true; }
  replaceChildren(...kids) { this.children = kids; return undefined; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) || []), fn]); }
  dispatchEvent(event) { (this.listeners.get(event.type) || []).forEach(fn => fn(event)); return true; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  getContext() { return {}; }
}

function makeEventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, fn) { listeners.set(type, [...(listeners.get(type) || []), fn]); },
    removeEventListener(type, fn) { listeners.set(type, (listeners.get(type) || []).filter(x => x !== fn)); },
    dispatchEvent(event) { (listeners.get(event.type) || []).forEach(fn => fn(event)); return true; }
  };
}

export function createFakeDom(clock) {
  const elements = new Map();
  const documentElement = new FakeElement("html", "html");
  const body = new FakeElement("body", "body");
  const documentTarget = makeEventTarget();
  const document = {
    documentElement,
    body,
    readyState: "complete",
    createElement: tag => new FakeElement(tag),
    createTextNode: text => ({ nodeType: 3, textContent: String(text) }),
    getElementById: id => elements.get(id) || null,
    querySelector(selector) { return selector === "canvas" ? elements.get("canvas") || null : null; },
    querySelectorAll() { return []; },
    register: id => elements.set(id, new FakeElement(id === "canvas" ? "canvas" : "div", id)).get(id),
    addEventListener: documentTarget.addEventListener,
    removeEventListener: documentTarget.removeEventListener,
    dispatchEvent: documentTarget.dispatchEvent
  };
  ["ikar", "menu", "loading", "canvas"].forEach(id => document.register(id));
  const winTarget = makeEventTarget();
  const win = {
    document,
    navigator: { hardwareConcurrency: 4, deviceMemory: 4, userAgent: "NodeHeadless" },
    devicePixelRatio: 2,
    innerWidth: 1280,
    innerHeight: 720,
    performance: { now: clock.now },
    requestAnimationFrame: clock.requestAnimationFrame,
    cancelAnimationFrame: clock.cancelAnimationFrame,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    CustomEvent: class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } },
    Event: class Event { constructor(type, init = {}) { this.type = type; Object.assign(this, init); } },
    addEventListener: winTarget.addEventListener,
    removeEventListener: winTarget.removeEventListener,
    dispatchEvent: winTarget.dispatchEvent
  };
  return { window: win, document, elements };
}
