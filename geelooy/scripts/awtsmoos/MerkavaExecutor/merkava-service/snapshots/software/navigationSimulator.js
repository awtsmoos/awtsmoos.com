// B"H
/**
 * @file navigationSimulator.js
 * @description Merkava browser navigation simulator.
 *
 * Mimics real browser navigation: session history (back/forward/pushState/
 * replaceState), window.location, navigation events (beforeunload, load,
 * DOMContentLoaded, hashchange, popstate), redirects, fragment navigation
 * with scroll restoration, and multi-page flows.
 *
 * Integration: `createNavigationHostAPI(browser)` returns plain host objects
 * designed for the MerkavaVM constructor's `hostAPI`/`context` injection
 * points, so page JS running in the real VM can call history.pushState(),
 * location.href = ..., etc., and the renderer responds.
 */
import { renderVirtualSnapshotPng } from "../virtualPngRenderer.js";
import { parseHtmlToDom, extractStyleText } from "./htmlParser.js";
import { buildLayoutTree } from "./domLayout.js";
import { writeFileSync } from "fs";

const REDIRECT_LIMIT = 10;

/* ------------------------------------------------------------------ */
/* URL utilities                                                       */
/* ------------------------------------------------------------------ */

const ABS_URL_RE = /^([a-z][a-z0-9+.-]*):\/\/([^\/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/i;

export function parseMerkavaUrl(href, base) {
  const raw = String(href || "").trim();
  const b = base ? parseMerkavaUrl(base) : null;
  const m = raw.match(ABS_URL_RE);
  let protocol, host, pathname, search, hash;
  if (m) {
    protocol = m[1].toLowerCase() + ":";
    host = m[2].toLowerCase();
    pathname = m[3] || "/";
    search = m[4] || "";
    hash = m[5] || "";
  } else {
    if (!b) throw new Error("navigation: relative URL without base: " + raw);
    protocol = b.protocol;
    host = b.host;
    const hashIdx = raw.indexOf("#");
    hash = hashIdx >= 0 ? raw.slice(hashIdx) : "";
    const noHash = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
    const qIdx = noHash.indexOf("?");
    search = qIdx >= 0 ? noHash.slice(qIdx) : "";
    let path = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;
    if (path.startsWith("/")) {
      pathname = path || "/";
    } else if (path === "") {
      pathname = b.pathname;
      if (!search) search = b.search;
    } else {
      const dir = b.pathname.endsWith("/") ? b.pathname : b.pathname.slice(0, b.pathname.lastIndexOf("/") + 1);
      pathname = dir + path;
    }
    pathname = normalizePath(pathname);
  }
  if (!pathname.startsWith("/")) pathname = "/" + pathname;
  const [hostname, port] = host.split(":");
  const origin = `${protocol}//${host}`;
  const hrefOut = origin + pathname + search + hash;
  return { href: hrefOut, protocol, host, hostname, port: port || "", pathname, search, hash, origin };
}

function normalizePath(p) {
  const parts = [];
  for (const seg of String(p).split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return "/" + parts.join("/");
}

/** History entries compare without the fragment. */
export function stripHash(href) {
  const i = String(href).indexOf("#");
  return i >= 0 ? String(href).slice(0, i) : String(href);
}

/* ------------------------------------------------------------------ */
/* Event target                                                        */
/* ------------------------------------------------------------------ */

export class MerkavaEventTarget {
  constructor() {
    this._listeners = new Map();
  }
  addEventListener(type, fn) {
    if (typeof fn !== "function") return;
    const t = String(type);
    if (!this._listeners.has(t)) this._listeners.set(t, []);
    this._listeners.get(t).push(fn);
  }
  removeEventListener(type, fn) {
    const arr = this._listeners.get(String(type));
    if (!arr) return;
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }
  dispatchEvent(event) {
    const arr = this._listeners.get(String(event.type)) || [];
    event.target = event.target || this;
    event.defaultPrevented = false;
    event.preventDefault = () => { event.defaultPrevented = true; };
    for (const fn of [...arr]) {
      try { fn.call(this, event); } catch (e) { /* handler errors don't break nav */ }
    }
    return !event.defaultPrevented;
  }
}

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

export class MerkavaHistory extends MerkavaEventTarget {
  constructor(browser) {
    super();
    this._browser = browser;
    this.entries = [];
    this.index = -1;
    this.scrollRestoration = "auto";
  }
  get length() { return this.entries.length; }
  get state() {
    const e = this.entries[this.index];
    return e ? e.state : null;
  }
  back() { this._browser._traverse(-1); }
  forward() { this._browser._traverse(1); }
  go(delta) {
    const n = Math.trunc(Number(delta) || 0);
    if (n === 0) { this._browser._reload(); return; }
    this._browser._traverse(n);
  }
  pushState(state, title, url) {
    const b = this._browser;
    const parsed = parseMerkavaUrl(url == null ? b.currentUrl() : url, b.currentUrl());
    // Same-document check is not required for pushState; cross-document pushState
    // to another origin would throw in a real browser — enforce same origin.
    const cur = parseMerkavaUrl(b.currentUrl());
    if (parsed.origin !== cur.origin) throw new Error("navigation: pushState cross-origin denied");
    b._saveScroll();
    this.entries = this.entries.slice(0, this.index + 1);
    this.entries.push({ url: parsed.href, state: state ?? null, title: String(title || ""), scrollX: 0, scrollY: 0 });
    this.index = this.entries.length - 1;
    // No reload, no popstate — per spec. The SPA re-renders via renderCurrent().
  }
  replaceState(state, title, url) {
    const b = this._browser;
    const e = this.entries[this.index];
    if (!e) return;
    const parsed = parseMerkavaUrl(url == null ? e.url : url, b.currentUrl());
    const cur = parseMerkavaUrl(b.currentUrl());
    if (parsed.origin !== cur.origin) throw new Error("navigation: replaceState cross-origin denied");
    e.url = parsed.href;
    e.state = state ?? null;
    if (title != null) e.title = String(title);
  }
}

/* ------------------------------------------------------------------ */
/* Location                                                            */
/* ------------------------------------------------------------------ */

export class MerkavaLocation {
  constructor(browser) { this._browser = browser; }
  _parsed() { return parseMerkavaUrl(this._browser.currentUrl()); }
  get href() { return this._parsed().href; }
  set href(v) { this._browser.navigate(v); }
  get protocol() { return this._parsed().protocol; }
  get host() { return this._parsed().host; }
  get hostname() { return this._parsed().hostname; }
  get port() { return this._parsed().port; }
  get pathname() { return this._parsed().pathname; }
  get search() { return this._parsed().search; }
  get hash() { return this._parsed().hash; }
  set hash(v) {
    const h = String(v || "");
    this._browser.navigateToFragment(h.startsWith("#") ? h : "#" + h);
  }
  get origin() { return this._parsed().origin; }
  assign(url) { this._browser.navigate(url); }
  replace(url) { this._browser.navigate(url, { replace: true }); }
  reload() { this._browser._reload(); }
  toString() { return this.href; }
}

/* ------------------------------------------------------------------ */
/* Browser                                                             */
/* ------------------------------------------------------------------ */

function extractTitle(html) {
  const m = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim().slice(0, 200) : "";
}

export class MerkavaBrowser extends MerkavaEventTarget {
  constructor(options = {}) {
    super();
    this.baseUrl = String(options.baseUrl || "https://merkava.test/");
    this.width = Math.max(1, Number(options.width) || 960);
    this.height = Math.max(1, Number(options.height) || 700);
    this.pages = new Map();      // normalized href (no hash) -> html
    this.redirects = new Map();  // normalized href (no hash) -> target href
    this.history = new MerkavaHistory(this);
    this.location = new MerkavaLocation(this);
    this.scrollX = 0;
    this.scrollY = 0;
    this._dom = null;
    this._cssText = "";
    this._html = "";
    this.lastResult = null;
    this.eventLog = [];
    // window facade for page scripts
    this.window = {
      history: this.history,
      location: this.location,
      addEventListener: (t, f) => this.addEventListener(t, f),
      removeEventListener: (t, f) => this.removeEventListener(t, f),
      dispatchEvent: (e) => this.dispatchEvent(e),
      document: { get title() { return ""; } },
    };
    const self = this;
    Object.defineProperty(this.window.document, "title", { get: () => extractTitle(self._html) });
  }

  _norm(href) { return stripHash(parseMerkavaUrl(href, this.baseUrl).href); }
  currentUrl() {
    const e = this.history.entries[this.history.index];
    return e ? e.url : this.baseUrl;
  }
  currentTitle() {
    const e = this.history.entries[this.history.index];
    return e ? (e.title || extractTitle(this._html)) : "";
  }

  registerPage(url, html) { this.pages.set(this._norm(url), String(html)); return this; }
  registerRedirect(from, to) { this.redirects.set(this._norm(from), String(to)); return this; }

  _log(type, detail) { this.eventLog.push({ type, ...detail }); }

  _resolveRedirects(href) {
    let cur = stripHash(href);
    const chain = [];
    for (let i = 0; i < REDIRECT_LIMIT; i++) {
      const target = this.redirects.get(cur);
      if (!target) break;
      chain.push({ from: cur, to: target });
      cur = stripHash(parseMerkavaUrl(target, this.baseUrl).href);
    }
    return { final: cur, chain };
  }

  _pageHtml(normalizedHref) {
    if (this.pages.has(normalizedHref)) return this.pages.get(normalizedHref);
    return `<!DOCTYPE html><html><head><title>404 Not Found</title></head>` +
      `<body style="background:#fff;color:#1e293b;font-family:sans-serif;padding:40px">` +
      `<h1>404 Not Found</h1><p>No page registered for ${normalizedHref}</p></body></html>`;
  }

  /** Full document navigation. Returns the final URL. */
  navigate(url, options = {}) {
    const target = parseMerkavaUrl(url, this.currentUrl()).href;
    // beforeunload — cancelable
    const proceed = this.dispatchEvent({ type: "beforeunload" });
    this._log("beforeunload", { url: target, proceeded: proceed });
    if (!proceed) return this.currentUrl();
    const { final, chain } = this._resolveRedirects(target);
    for (const c of chain) this._log("redirect", c);
    const hash = parseMerkavaUrl(target).hash;
    const finalUrl = final + hash;
    this._saveScroll();
    const entry = { url: finalUrl, state: null, title: "", scrollX: 0, scrollY: 0 };
    if (options.replace && this.history.index >= 0) {
      this.history.entries[this.history.index] = entry;
    } else {
      this.history.entries = this.history.entries.slice(0, this.history.index + 1);
      this.history.entries.push(entry);
      this.history.index = this.history.length - 1;
    }
    this.scrollX = 0; this.scrollY = 0;
    this._loadDocument(finalUrl);
    return finalUrl;
  }

  /** Same-document fragment navigation. */
  navigateToFragment(hash) {
    const h = String(hash || "");
    const frag = h.startsWith("#") ? h : "#" + h;
    const cur = parseMerkavaUrl(this.currentUrl());
    const newUrl = cur.origin + cur.pathname + cur.search + frag;
    if (newUrl === this.currentUrl()) return this.currentUrl();
    this._saveScroll();
    const oldURL = this.currentUrl();
    const entry = this.history.entries[this.history.index];
    // Fragment nav creates a new history entry (real browser behavior).
    const next = { url: newUrl, state: entry ? entry.state : null, title: entry ? entry.title : "", scrollX: this.scrollX, scrollY: this.scrollY };
    this.history.entries = this.history.entries.slice(0, this.history.index + 1);
    this.history.entries.push(next);
    this.history.index = this.history.length - 1;
    // Scroll to anchor if present.
    const id = frag.slice(1);
    const y = id ? this._anchorY(id) : 0;
    this.scrollY = y; this.scrollX = 0;
    next.scrollY = y;
    this.dispatchEvent({ type: "hashchange", oldURL, newURL: newUrl });
    this._log("hashchange", { oldURL, newURL: newUrl, scrollY: y });
    this.render();
    return newUrl;
  }

  _saveScroll() {
    const e = this.history.entries[this.history.index];
    if (e) { e.scrollX = this.scrollX; e.scrollY = this.scrollY; }
  }

  _traverse(delta) {
    const h = this.history;
    const next = h.index + Math.trunc(delta);
    if (next < 0 || next >= h.entries.length || next === h.index) return false;
    this.dispatchEvent({ type: "beforeunload" });
    this._saveScroll();
    h.index = next;
    const entry = h.entries[next];
    this.scrollX = entry.scrollX || 0;
    this.scrollY = entry.scrollY || 0;
    // Same-document re-render (no reload): parse + render, then popstate.
    this._parseCurrent(entry.url);
    this.render();
    this.dispatchEvent({ type: "popstate", state: entry.state });
    this._log("popstate", { url: entry.url, state: entry.state, scrollY: this.scrollY });
    return true;
  }

  _reload() {
    const entry = this.history.entries[this.history.index];
    if (!entry) return;
    this.dispatchEvent({ type: "beforeunload" });
    this._loadDocument(entry.url);
    this._log("reload", { url: entry.url });
  }

  _parseCurrent(url) {
    const normalized = stripHash(url);
    this._html = this._pageHtml(normalized);
    try { this._dom = parseHtmlToDom(this._html); }
    catch { this._dom = null; }
    this._cssText = extractStyleText(this._html) || "";
  }

  _loadDocument(url) {
    this._parseCurrent(url);
    this.dispatchEvent({ type: "DOMContentLoaded", url });
    this._log("DOMContentLoaded", { url });
    this.render();
    this.dispatchEvent({ type: "load", url });
    this._log("load", { url });
  }

  /** Re-render the current entry without touching history (SPA view update). */
  renderCurrent() { this._parseCurrent(this.currentUrl()); this.render(); return this.lastResult; }

  render() {
    const snapshot = this._dom ? { dom: this._dom, cssText: this._cssText } : { html: this._html };
    this.lastResult = renderVirtualSnapshotPng(snapshot, { width: this.width, height: this.height });
    return this.lastResult;
  }

  savePng(path) {
    if (!this.lastResult) this.render();
    writeFileSync(path, Buffer.from(this.lastResult.dataUrl.split(",")[1], "base64"));
    return path;
  }

  /** Y offset of the element with the given id (for fragment scroll). */
  _anchorY(id) {
    try {
      const cssText = this._cssText;
      const dom = this._dom;
      if (!dom) return 0;
      const layout = buildLayoutTree(dom, { width: this.width, height: this.height }, { cssText });
      for (const item of layout) {
        const attrs = item?.node?.attributes || {};
        if (attrs.id === id) return Math.max(0, Math.round(item.y || 0));
      }
    } catch { /* fall through */ }
    return 0;
  }

  /** Visible text of the current page (for assertions). */
  pageText() {
    try {
      const dom = this._dom;
      if (!dom) return "";
      const layout = buildLayoutTree(dom, { width: this.width, height: this.height }, { cssText: this._cssText });
      const parts = [];
      for (const item of layout) {
        if (item && (item.kind === "#text") && item.text) parts.push(String(item.text).trim());
      }
      return parts.filter(Boolean).join(" ").replace(/\s+/g, " ");
    } catch { return ""; }
  }

  /**
   * Run a real JS function as "page script" against the window facade.
   * Returns whatever the function returns. Re-renders if navigation occurred.
   */
  runPageScript(fn) {
    const before = this.currentUrl();
    const out = fn(this.window);
    if (this.currentUrl() !== before) this.render();
    return out;
  }

  /**
   * Host API for MerkavaVM injection. Merge into the VM constructor's
   * `hostAPI` and/or `context` so page JS in the real VM can call
   * history.pushState(), location.href = ..., addEventListener(...), etc.
   */
  createNavigationHostAPI() {
    return {
      history: this.history,
      location: this.location,
      window: this.window,
      addEventListener: (t, f) => this.addEventListener(t, f),
      removeEventListener: (t, f) => this.removeEventListener(t, f),
    };
  }
}
