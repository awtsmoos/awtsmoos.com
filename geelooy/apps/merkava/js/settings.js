// B"H — Settings store: theme, JS, WASM accel, viewport, homepage, search engine.
const KEY = "merkava.settings.v1";

export const SEARCH_ENGINES = {
  duckduckgo: { name: "DuckDuckGo", template: "https://duckduckgo.com/html/?q={q}" },
  brave:      { name: "Brave Search", template: "https://search.brave.com/search?q={q}" },
  startpage:  { name: "Startpage", template: "https://www.startpage.com/sp/search?query={q}" },
  google:     { name: "Google", template: "https://www.google.com/search?q={q}" },
  custom:     { name: "Custom…", template: "" },
};

export const VIEWPORTS = {
  auto:      { name: "Auto (fit window)", w: 0, h: 0 },
  v1280x800: { name: "1280 × 800", w: 1280, h: 800 },
  v1366x768: { name: "1366 × 768", w: 1366, h: 768 },
  v1920x1200:{ name: "1920 × 1200 (engine max)", w: 1920, h: 1200 },
};

export const DEFAULTS = {
  theme: "dark",          // dark | light
  jsEnabled: true,        // page JS: on = createPage runs <script>s in the Merkava VM; off = static renderPage
  wasmAccel: true,        // forwarded to the engine; the web build has no software
                          // pixel fallback yet, so rendering still uses WASM when off
  viewport: "auto",       // key of VIEWPORTS
  homepage: "about:home",
  searchEngine: "duckduckgo",
  customSearch: "",       // template with {q} when searchEngine === "custom"
};

function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch {}
  return { ...DEFAULTS, ...s };
}

export class SettingsStore {
  constructor() { this.values = load(); }

  get(k) { return this.values[k]; }
  set(k, v) {
    this.values[k] = v;
    try { localStorage.setItem(KEY, JSON.stringify(this.values)); } catch {}
  }

  applyTheme() {
    document.documentElement.dataset.theme = this.values.theme === "light" ? "light" : "dark";
  }

  /** Viewport size in CSS px for the engine render (0 = fit window). */
  viewportSize(fallbackW, fallbackH) {
    const v = VIEWPORTS[this.values.viewport] || VIEWPORTS.auto;
    return { w: v.w || fallbackW, h: v.h || fallbackH };
  }

  /** Build a search URL for a query. */
  searchUrl(query) {
    const key = this.values.searchEngine;
    let tpl = key === "custom"
      ? (this.values.customSearch || "").trim()
      : (SEARCH_ENGINES[key] || SEARCH_ENGINES.duckduckgo).template;
    if (!tpl) tpl = SEARCH_ENGINES.duckduckgo.template;
    return tpl.includes("{q}")
      ? tpl.replace("{q}", encodeURIComponent(query))
      : tpl + encodeURIComponent(query);
  }
}
