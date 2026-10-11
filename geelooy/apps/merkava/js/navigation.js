// B"H — Navigation: address bar, back/forward/reload, per-tab history stacks,
// fetching page HTML, engine rendering, CORS notice + error pages.
import { renderToCanvas, createInteractivePage, blitRender, clickPageAt, extractTitle, ENGINE_MAX_VIEWPORT } from "./engine-adapter.js";
import { renderChromePage, CHROME_PAGES } from "./about-pages.js";

const TYPED_HTML_RE = /^\s*<\s*[a-z!][\s\S]*$/i;
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

function looksLikeUrl(s) {
  if (SCHEME_RE.test(s)) return true;
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(s)) return true; // host.tld[/…]
  if (/^localhost(:\d+)?(\/\S*)?$/.test(s)) return true;
  return false;
}

export class Navigator {
  constructor({ tabs, settings, history, bookmarks, downloads, extUI, notice, status, viewportEl }) {
    this.tabs = tabs;
    this.settings = settings;
    this.historyStore = history;
    this.bookmarks = bookmarks;
    this.downloads = downloads;
    this.extUI = extUI;
    this.notice = notice;     // { show(html), hide() }
    this.status = status;     // { set(obj) }
    this.viewportEl = viewportEl;
  }

  /** Classify raw address-bar input. */
  classify(input) {
    const s = String(input || "").trim();
    if (!s) return { kind: "empty" };
    if (s.startsWith("about:")) return { kind: "chrome", name: s.slice(6).split(/[?#]/)[0] || "blank" };
    if (TYPED_HTML_RE.test(s)) return { kind: "html", html: s };
    if (looksLikeUrl(s)) {
      const url = SCHEME_RE.test(s) ? s : "https://" + s;
      return { kind: "url", url };
    }
    return { kind: "search", query: s };
  }

  async navigate(tab, rawInput, { push = true } = {}) {
    if (!tab) return;
    const c = this.classify(rawInput);
    tab.loading = true;
    try {
      if (c.kind === "empty") return;
      if (c.kind === "chrome") return this.#showChrome(tab, c.name, push);
      if (c.kind === "search") {
        const url = this.settings.searchUrl(c.query);
        return this.#loadRemote(tab, url, push, { searchNote: c.query });
      }
      if (c.kind === "html") return this.#renderHtml(tab, c.html, "typed html", push, false);
      return this.#loadRemote(tab, c.url, push);
    } finally {
      tab.loading = false;
    }
  }

  #showChrome(tab, name, push) {
    const pageName = CHROME_PAGES[name] ? name : "blank";
    const url = "about:" + pageName;
    const node = renderChromePage(pageName, this.#chromeCtx(tab));
    this.tabs.showChrome(tab, pageName, node);
    if (push) this.#push(tab, { url, html: null, chrome: pageName, title: this.#chromeTitle(pageName), remote: false });
    else this.#replace(tab, { url, html: null, chrome: pageName, title: this.#chromeTitle(pageName), remote: false });
    tab.url = url;
    this.tabs.setTitle(tab, this.#chromeTitle(pageName));
    this.status.set({ mode: "chrome page" });
  }

  #chromeTitle(name) {
    return { home: "Home", history: "History", bookmarks: "Bookmarks", downloads: "Downloads", settings: "Settings", extensions: "Extensions", version: "Version", blank: "New tab" }[name] || name;
  }

  #chromeCtx(tab) {
    return {
      tab,
      settings: this.settings,
      history: this.historyStore,
      bookmarks: this.bookmarks,
      downloads: this.downloads,
      extUI: this.extUI,
      navigate: (url, opts) => this.navigate(tab, url, opts),
      notice: this.notice,
    };
  }

  async #loadRemote(tab, url, push, extra = {}) {
    this.status.set({ mode: "fetching…" });
    let html;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error("HTTP " + res.status + " " + res.statusText);
      const ct = res.headers.get("content-type") || "";
      if (!/text\/html|application\/xhtml/i.test(ct) && /\.(pdf|png|jpe?g|gif|webp|zip|mp4|mp3)(\?|$)/i.test(url)) {
        // Binary: hand to the download shelf instead of the engine.
        await this.downloads.download(url);
        this.notice.show("<b>Download started</b> — " + escapeHtml(url) + " is a file; it went to the download shelf below.");
        this.status.set({ mode: "download" });
        return;
      }
      html = await res.text();
    } catch (e) {
      return this.#renderError(tab, url, e, push);
    }
    this.#renderHtml(tab, html, url, push, true, extra);
  }

  async #renderHtml(tab, html, label, push, remote, extra = {}) {
    this.tabs.showCanvas(tab);
    const vp = this.#viewportPx();
    let engine;
    try {
      engine = await this.tabs.engineFor(tab);
    } catch (e) {
      return this.#renderError(tab, label, new Error("Engine failed to start: " + e.message), push);
    }
    try {
      const jsOn = this.settings.get("jsEnabled") !== false;
      const wasmAccel = this.settings.get("wasmAccel") !== false;
      const opts = { width: vp.w, height: vp.h, jsEnabled: jsOn, wasmAccel };
      let mode, r;
      if (jsOn && typeof engine.createPage === "function") {
        // Interactive: page <script>s run in the Merkava VM; later host
        // clicks hit-test against page.__adapter.tree (see clickPageAt).
        // createPage is async (scripts compile+run before first paint).
        const page = await createInteractivePage(engine, html, opts);
        blitRender(tab.canvas, page.lastRender);
        tab.page = page;
        r = page.lastRender;
        mode = (remote ? (extra.searchNote ? "search" : "remote HTML") : "local HTML") + " · interactive (JS in Merkava VM)";
      } else {
        // Static: no page-JS execution (JS setting off, or old engine).
        r = renderToCanvas(engine, tab.canvas, html, opts);
        tab.page = null;
        mode = (remote ? (extra.searchNote ? "search" : "remote HTML") : "local HTML") + (jsOn ? " · static (no createPage)" : " · static (JS off)");
      }
      const title = extractTitle(html, label.replace(/^https?:\/\//, "").slice(0, 60));
      const entry = { url: label, html, chrome: null, title, remote };
      if (push) this.#push(tab, entry); else this.#replace(tab, entry);
      tab.url = label;
      this.tabs.setTitle(tab, title);
      if (remote && /^https?:/.test(label)) this.historyStore.add(label, title);
      this.status.set({ ms: r.ms, items: r.layoutItems, backend: r.backend, mode });
    } catch (e) {
      this.#renderError(tab, label, e, push);
    }
  }

  /**
   * Host canvas click at engine-pixel (x, y): hit-test the guest layout,
   * dispatch to the guest's click listeners, re-blit, and follow <a href>.
   * Returns true when the click landed on page content.
   */
  clickPageAt(tab, x, y) {
    const page = tab && tab.page;
    if (!page || tab.chrome) return false;
    let res;
    try {
      res = clickPageAt(page, x, y);
    } catch (e) {
      this.notice.show("<b>Click failed:</b> " + escapeHtml(String((e && e.message) || e)).slice(0, 160));
      return false;
    }
    if (res.render) {
      blitRender(tab.canvas, res.render);
      this.status.set({ ms: res.render.ms, items: res.render.layoutItems, backend: res.render.backend, mode: "click" });
    }
    const bad = (res.results || []).filter((r) => !r.ok);
    if (bad.length) {
      this.notice.show("<b>Page click handler error:</b> " + escapeHtml(String(bad[0].error || "unknown")).slice(0, 160), 5000);
    }
    if (res.href && !res.defaultPrevented) {
      const href = res.href;
      if (/^#/.test(href)) return !!res.hit; // fragment-only: no scroll model yet
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("about:")) {
        this.navigate(tab, href);
        return true;
      }
      if (/^https?:/.test(tab.url)) {
        try { this.navigate(tab, new URL(href, tab.url).href); return true; }
        catch { /* fall through */ }
      }
      // Relative link on a non-remote page (typed HTML): cannot resolve.
      this.notice.show("Link <b>" + escapeHtml(href).slice(0, 80) + "</b> is relative and this page has no base URL.", 5000);
    }
    return !!res.hit;
  }

  #renderError(tab, url, err, push) {
    this.tabs.showCanvas(tab);
    const msg = String((err && err.message) || err);
    const cors = /failed to fetch|networkerror|load failed|cors/i.test(msg);
    const html = errorPageHtml(url, msg, cors);
    const vp = this.#viewportPx();
    try {
      const engine = this.tabs.engineFor(tab);
      Promise.resolve(engine).then((eng) => {
        if (eng) renderToCanvas(eng, tab.canvas, html, { width: vp.w, height: vp.h });
      }).catch(() => {});
    } catch {}
    const title = "Error — " + String(url).slice(0, 40);
    const entry = { url: String(url), html, chrome: null, title, remote: false, error: true };
    if (push) this.#push(tab, entry); else this.#replace(tab, entry);
    tab.url = String(url);
    this.tabs.setTitle(tab, title);
    if (cors) {
      this.notice.show(
        "<b>Cross-origin fetch blocked (CORS).</b> The host page at " + escapeHtml(String(url).slice(0, 80)) +
        " did not permit this browser to read it. The site owner must send " +
        "<b>Access-Control-Allow-Origin</b> for remote reads to work. " +
        "Tip: paste the page's HTML into the address bar (starting with <tt>&lt;</tt>) to render it locally."
      );
    } else {
      this.notice.show("<b>Could not load page:</b> " + escapeHtml(msg).slice(0, 220));
    }
    this.status.set({ mode: "error" });
  }

  #push(tab, entry) {
    tab.history = tab.history.slice(0, tab.hi + 1);
    tab.history.push(entry);
    tab.hi = tab.history.length - 1;
  }

  #replace(tab, entry) {
    if (tab.hi >= 0) tab.history[tab.hi] = entry;
    else { tab.history.push(entry); tab.hi = 0; }
  }

  back(tab) {
    if (!tab || tab.hi <= 0) return;
    tab.hi--;
    this.#restore(tab);
  }

  forward(tab) {
    if (!tab || tab.hi >= tab.history.length - 1) return;
    tab.hi++;
    this.#restore(tab);
  }

  reload(tab) {
    if (!tab || tab.hi < 0) return;
    const e = tab.history[tab.hi];
    this.navigate(tab, e.url, { push: false });
  }

  #restore(tab) {
    const e = tab.history[tab.hi];
    if (!e) return;
    if (e.chrome) this.#showChrome(tab, e.chrome, false);
    else this.#renderHtml(tab, e.html, e.url, false, e.remote);
  }

  #viewportPx() {
    const r = this.viewportEl.getBoundingClientRect();
    const base = this.settings.viewportSize(Math.max(1, Math.floor(r.width)), Math.max(1, Math.floor(r.height)));
    return {
      w: Math.min(base.w, ENGINE_MAX_VIEWPORT.width),
      h: Math.min(base.h, ENGINE_MAX_VIEWPORT.height),
    };
  }

  canBack(tab) { return !!tab && tab.hi > 0; }
  canForward(tab) { return !!tab && tab.hi < tab.history.length - 1; }

  /** Re-render the current entry at the live viewport size (resize), no refetch.
   *  Interactive pages are rebuilt (page scripts re-run) — cheap and correct. */
  refreshViewport(tab) {
    if (!tab || tab.hi < 0) return;
    const e = tab.history[tab.hi];
    if (e.chrome || e.html == null) return;
    this.#renderHtml(tab, e.html, e.url, false, e.remote);
  }
}

function errorPageHtml(url, msg, cors) {
  const kind = cors ? "Cross-origin read blocked (CORS)" : "Page failed to load";
  const advice = cors
    ? "This browser fetches pages with the host fetch() API, so the site's CORS policy applies. " +
      "The server must send Access-Control-Allow-Origin for Merkava to read the page. " +
      "Workarounds: paste the page HTML into the address bar starting with &lt;, or open it from the same origin."
    : "Check the address and your connection, then reload.";
  return "<!doctype html><html><head><title>Error</title><style>" +
    "body{margin:0;background:#141a2e;color:#e9edf7;font-family:Verdana,sans-serif;padding:60px 40px}" +
    "h1{color:#ff7a86;font-size:24px}.box{background:#0d1222;border:1px solid #27334f;border-radius:12px;padding:20px;max-width:640px}" +
    "code{color:#ffcf6e;word-break:break-all}.tip{color:#9aa7c4;font-size:13px;margin-top:14px;line-height:1.6}" +
    "</style></head><body><h1>" + escapeHtml(kind) + "</h1><div class=\"box\">" +
    "<p><code>" + escapeHtml(String(url)).slice(0, 160) + "</code></p>" +
    "<p>" + escapeHtml(msg).slice(0, 300) + "</p>" +
    "<p class=\"tip\">" + advice + "</p></div></body></html>";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
