// B"H
/** Proves label == selected tab for Windows/macOS/Linux/unknown (Run 11). */
import assert from "node:assert/strict";

class El {
  constructor() {
    this.dataset = {}; this.textContent = ""; this.attrs = {};
    this.handlers = {}; const s = new Set(); this._set = s;
    this.classList = {
      toggle: (c, on) => on ? s.add(c) : s.delete(c),
      contains: c => s.has(c),
      add: c => s.add(c), remove: c => s.delete(c)
    };
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k]; }
  addEventListener(k, fn) { this.handlers[k] = fn; }
  click() { if (this.handlers.click) this.handlers.click(); }
}

const CHROME = "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const CASES = [
  { name: "Windows", ua: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) ${CHROME}`,
    tab: "powershell", tabName: "Windows PowerShell", detected: "Windows" },
  { name: "macOS", ua: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ${CHROME}`,
    tab: "unix", tabName: "Mac / Linux", detected: "macOS" },
  { name: "Linux", ua: `Mozilla/5.0 (X11; Linux x86_64) ${CHROME}`,
    tab: "unix", tabName: "Mac / Linux", detected: "Linux" },
  { name: "unknown", ua: "SomeBot/1.0 (+https://example.invalid/bot)",
    tab: "powershell", tabName: "Windows PowerShell", detected: null }
];

let n = 0;
for (const c of CASES) {
  n += 1;
  // DOM stub: start from a WRONG active tab (cmd) so a pass proves the
  // detection actually drove the selection, not the shipped default.
  const tabs = ["powershell", "cmd", "unix"].map(id => {
    const b = new El(); b.dataset.tab = id;
    if (id === "cmd") { b._set.add("active"); b.attrs["aria-selected"] = "true"; }
    return b;
  });
  const panes = ["powershell", "cmd", "unix"].map(id => {
    const p = new El(); p.dataset.pane = id;
    if (id === "cmd") p._set.add("active");
    return p;
  });
  const methods = ["native", "browser", "virtual"].map(k => {
    const b = new El(); b.dataset.method = k; return b;
  });
  const root = new El();
  root.querySelectorAll = sel => sel === "[data-method]" ? methods : [];
  const note = new El();
  const byId = {
    onboarding: root, onboardDetail: new El(), onboardGo: new El(),
    platformNote: note
  };
  globalThis.navigator = { userAgent: c.ua };
  globalThis.document = {
    readyState: "complete",
    getElementById: id => byId[id] || null,
    querySelector: () => null,
    querySelectorAll: sel =>
      sel === "[data-tab]" ? tabs : sel === "[data-pane]" ? panes : [],
    addEventListener: () => {}
  };
  // Fresh module instance per UA (query suffix) so auto-mount re-runs.
  const mod = await import(`../onboarding.js?case=${n}`);
  assert.equal(mod.detectPlatform(c.ua).tab, c.tab, `${c.name}: detect tab`);
  assert.equal(mod.detectInstallTab(c.ua), c.tab, `${c.name}: legacy tab fn`);
  const active = tabs.filter(b => b.classList.contains("active"));
  assert.equal(active.length, 1, `${c.name}: exactly one active tab`);
  assert.equal(active[0].dataset.tab, c.tab, `${c.name}: selected tab`);
  assert.equal(active[0].attrs["aria-selected"], "true");
  const activePanes = panes.filter(p => p.classList.contains("active"));
  assert.equal(activePanes.length, 1, `${c.name}: exactly one active pane`);
  assert.equal(activePanes[0].dataset.pane, c.tab, `${c.name}: pane matches tab`);
  // The label must name the SAME tab that is selected.
  assert.ok(note.textContent.includes(c.tabName),
    `${c.name}: label names selected tab (${note.textContent})`);
  if (c.detected) {
    assert.ok(note.textContent.includes(`(detected: ${c.detected})`),
      `${c.name}: label names detected platform (${note.textContent})`);
  } else {
    assert.match(note.textContent, /not detected/,
      `unknown: label must be honest (${note.textContent})`);
  }
  console.log(`B'H platform detection ${c.name}: tab=${c.tab} label ok`);
}
console.log("B'H platform detection tests passed");
