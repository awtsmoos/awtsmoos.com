// B"H — Tabs: open/close/switch. Each tab owns one engine instance (lazy)
// and one canvas layer; chrome (about:) pages share a single DOM layer.
import { createEngine, publishPageEngine } from "./engine-adapter.js";

let seq = 0;

export class TabManager {
  constructor({ canvasesEl, chromeLayerEl, onTabsChanged, onSwitch, onCanvasClick }) {
    this.tabs = [];
    this.activeId = null;
    this.canvasesEl = canvasesEl;
    this.chromeLayerEl = chromeLayerEl;
    this.onTabsChanged = onTabsChanged || (() => {});
    this.onSwitch = onSwitch || (() => {});
    this.onCanvasClick = onCanvasClick || (() => {});
  }

  newTab() {
    const id = "t" + (++seq) + Date.now().toString(36);
    const canvas = document.createElement("canvas");
    canvas.className = "tab-canvas";
    canvas.dataset.tabId = id;
    // Host clicks on the page canvas -> guest hit-testing (engine-adapter).
    // Map CSS px back to engine pixels; the canvas bitmap is engine-sized.
    canvas.addEventListener("click", (e) => {
      const tab = this.get(id);
      if (!tab || tab.chrome || !tab.page) return;
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = (e.clientX - r.left) * (canvas.width / r.width);
      const y = (e.clientY - r.top) * (canvas.height / r.height);
      this.onCanvasClick(tab, x, y);
    });
    this.canvasesEl.appendChild(canvas);
    const tab = {
      id,
      title: "New tab",
      url: "about:blank",
      canvas,
      enginePromise: null,   // lazy per-tab engine instance
      engineError: null,
      page: null,            // live InteractivePage when JS is on, else null
      history: [],           // [{ url, html|null, chrome|null, title, remote }]
      hi: -1,
      chrome: null,          // current chrome page name, or null for engine pages
      loading: false,
    };
    this.tabs.push(tab);
    this.switchTo(id);
    this.onTabsChanged();
    return tab;
  }

  get(id) { return this.tabs.find((t) => t.id === id) || null; }
  get active() { return this.get(this.activeId); }

  /** Lazily create (and cache) this tab's engine instance. */
  engineFor(tab) {
    if (!tab.enginePromise && !tab.engineError) {
      tab.enginePromise = createEngine()
        .then((eng) => { publishPageEngine(eng); return eng; })
        .catch((e) => {
          tab.engineError = e;
          tab.enginePromise = null;
          throw e;
        });
    }
    return tab.enginePromise;
  }

  closeTab(id) {
    const i = this.tabs.findIndex((t) => t.id === id);
    if (i < 0) return;
    const [tab] = this.tabs.splice(i, 1);
    tab.canvas.remove();
    if (this.activeId === id) {
      const next = this.tabs[Math.min(i, this.tabs.length - 1)] || null;
      this.activeId = next ? next.id : null;
      this.#applyVisibility();
      if (next) this.onSwitch(next);
    }
    this.onTabsChanged();
  }

  switchTo(id) {
    const tab = this.get(id);
    if (!tab) return;
    this.activeId = id;
    this.#applyVisibility();
    this.onTabsChanged();
    this.onSwitch(tab);
  }

  /** Show the active tab's canvas or the shared chrome layer. */
  #applyVisibility() {
    for (const t of this.tabs) t.canvas.classList.toggle("visible", t.id === this.activeId && !t.chrome);
    if (this.active) {
      this.chromeLayerEl.classList.toggle("show", !!this.active.chrome);
    } else {
      this.chromeLayerEl.classList.remove("show");
    }
  }

  /** Route a tab to a chrome (about:) page or back to its canvas. */
  showChrome(tab, name, node) {
    tab.chrome = name;
    this.chromeLayerEl.innerHTML = "";
    if (node) this.chromeLayerEl.appendChild(node);
    this.#applyVisibility();
  }

  showCanvas(tab) {
    tab.chrome = null;
    this.#applyVisibility();
  }

  setTitle(tab, title) {
    tab.title = String(title || "New tab").slice(0, 80) || "New tab";
    this.onTabsChanged();
  }
}
