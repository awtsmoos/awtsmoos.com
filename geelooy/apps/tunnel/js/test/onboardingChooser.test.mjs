// B"H
/** Proves the Tunnel method chooser switches state on click (Run 04). */
import assert from "node:assert/strict";

class El {
  constructor(id = "") {
    this.id = id; this.dataset = {}; this.textContent = ""; this.attrs = {};
    this.handlers = {}; const s = new Set(); this._set = s;
    this.classList = { toggle: (c, on) => on ? s.add(c) : s.delete(c), contains: c => s.has(c) };
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k]; }
  addEventListener(k, fn) { this.handlers[k] = fn; }
  click() { if (this.handlers.click) this.handlers.click(); }
}
const buttons = ["native", "browser", "virtual"].map(k => {
  const b = new El(); b.dataset.method = k; return b;
});
const root = new El("onboarding");
root.querySelectorAll = sel => sel === "[data-method]" ? buttons : [];
const detail = new El("onboardDetail"), go = new El("onboardGo");
const byId = { onboarding: root, onboardDetail: detail, onboardGo: go, platformNote: new El("platformNote") };
globalThis.navigator = { userAgent: "node-test" };
globalThis.document = {
  readyState: "complete",
  getElementById: id => byId[id] || null,
  querySelector: () => null,
  addEventListener: () => {}
};

const { mountOnboarding } = await import("../onboarding.js");
// Auto-mount (module bottom) already ran mountOnboarding once; the guard
// must make a second explicit mount a no-op rather than double-binding.
mountOnboarding();
assert.equal(buttons[0].attrs["aria-pressed"], "true");
assert.match(detail.textContent, /Full local filesystem/);
assert.equal(go.attrs.href, "#install");

buttons[1].click();
assert.equal(buttons[1].attrs["aria-pressed"], "true");
assert.equal(buttons[0].attrs["aria-pressed"], "false");
assert.match(detail.textContent, /browser-local workspace/);
assert.equal(go.attrs.href, "#browser-mode");
assert.match(go.textContent, /Browser tunnel/);

buttons[2].click();
assert.equal(buttons[2].attrs["aria-pressed"], "true");
assert.match(detail.textContent, /Virtual OS/);
assert.equal(go.attrs.href, "#no-install");
console.log("B'H onboarding chooser click test passed");
