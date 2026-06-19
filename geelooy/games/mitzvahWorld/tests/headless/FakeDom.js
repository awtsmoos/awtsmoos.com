// B"H
/**
 * FakeDom: a small palace of tags where the Awtsmoos lets Node pretend it has
 * a document. It is not a browser, but it is enough to catch boot/perf drift.
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
  }
  appendChild(child) { this.children.push(child); return child; }
  addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) || []), fn]); }
  dispatchEvent(event) { (this.listeners.get(event.type) || []).forEach(fn => fn(event)); return true; }
  getContext() { return {}; }
}

export function createFakeDom(clock) {
  const elements = new Map();
  const documentElement = new FakeElement("html", "html");
  const body = new FakeElement("body", "body");
  const document = {
    documentElement,
    body,
    createElement: tag => new FakeElement(tag),
    getElementById: id => elements.get(id) || null,
    register: id => elements.set(id, new FakeElement("div", id)).get(id)
  };
  ["ikar", "menu", "loading"].forEach(id => document.register(id));
  const win = {
    document,
    navigator: { hardwareConcurrency: 4, deviceMemory: 4, userAgent: "NodeHeadless" },
    devicePixelRatio: 2,
    innerWidth: 1280,
    innerHeight: 720,
    performance: { now: clock.now },
    requestAnimationFrame: clock.requestAnimationFrame,
    cancelAnimationFrame: clock.cancelAnimationFrame,
    addEventListener() {},
    dispatchEvent() { return true; }
  };
  return { window: win, document, elements };
}
