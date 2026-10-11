// B"H — MerkavaExtensions real host: window.MerkavaExtensions backed by
// merkava-browser/ExtensionHost.js (Manifest V2+V3, background service
// workers through the Merkava VM, content scripts by match pattern,
// chrome.* APIs with localStorage-backed storage).
//
// LOAD ORDER (classic scripts, before the module bundle):
//   <script src="../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/ExtensionHost.js"></script>
//   <script src="../../scripts/awtsmoos/MerkavaExecutor/merkava-browser/VmScriptRunner.js"></script>
//   <script src="js/extensions-host.js"></script>
//   <script type="module" src="js/main.js"></script>
//
// Implements the SEAM CONTRACT from js/extensions-ui.js exactly:
//   { available, list(), get(id), setEnabled(id, enabled), uninstall(id),
//     loadUnpacked(files), openPopup(id, anchorEl), closePopup(),
//     on("change", cb), off("change", cb) }
// plus orchestrator aliases: toggle(id), onChanged(cb).
//
// HONEST V1 LIMITS (see EXTENSIONS_MOBILE.md):
//  - Unpacked extensions only (FileList from a directory picker). CRX3 files
//    need Buffer+zlib: extract server-side or via the tunnel, then load unpacked.
//  - Extension *files* are session-only (kept in memory); metadata + chrome.storage
//    persist in localStorage across reloads.
//  - Popup scripts do NOT execute in v1: the popup is rendered as static
//    HTML+CSS through the Merkava engine to canvas pixels.
//  - Background service workers run through the real Merkava VM only when the
//    page bundle provides the VM pipeline (window.MerkavaVmPipeline); without
//    it, startBackground fails with an honest error and the extension still
//    lists, toggles, and renders popups.
//  - chrome.tabs.* is the host's virtual tab list, not the app's TabManager
//    (wiring lands with the tabs worker).
(function () {
  "use strict";

  var REG_KEY = "merkava.ext.registry.v1";
  var changeListeners = new Set();
  function emit() { changeListeners.forEach(function (cb) { try { cb(); } catch (e) {} }); }

  function loadRegistry() {
    try { var a = JSON.parse(localStorage.getItem(REG_KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function saveRegistry(r) {
    try { localStorage.setItem(REG_KEY, JSON.stringify(r)); } catch (e) {}
  }

  // -- VM pipeline -----------------------------------------------------------
  // The browser bundle (or a bundler step) exposes the compiled pipeline as
  // window.MerkavaVmPipeline = { compileJsToCode, createDefaultHost,
  // decodeSangArtifact } and ensures globalThis.MerkavaVM exists (the VM
  // sources are plain scripts). When present, backgrounds run in the VM.
  function vmRunner() {
    var VR = window.Merkava && window.Merkava.VmScriptRunner;
    var pipe = window.MerkavaVmPipeline;
    if (!VR || !pipe) return null;
    if (typeof VR.setPipelineLoaders === "function" && !vmRunner._injected) {
      try { VR.setPipelineLoaders(pipe); vmRunner._injected = true; }
      catch (e) { return null; }
    }
    if (typeof window.MerkavaVM === "undefined") return null;
    return VR;
  }

  // -- popup renderer --------------------------------------------------------
  // fn(html, {width,height}) -> Promise<{data: Uint8ClampedArray, width, height}>
  var popupRenderer = null;
  function getPopupRenderer() {
    if (popupRenderer) return popupRenderer;
    var eng = window.__merkavaPageEngine; // engine worker's contract: renderPage(html, opts)
    if (eng && typeof eng.renderPage === "function") {
      return function (html, dims) {
        return Promise.resolve(eng.renderPage(String(html), {
          width: dims.width, height: dims.height, css: "", js: false, wasm: true,
        }));
      };
    }
    return null;
  }

  // -- host ------------------------------------------------------------------
  function RealHost() {
    var EH = window.Merkava && window.Merkava.ExtensionHostModule;
    if (!EH) throw new Error("extensions-host.js: Merkava.ExtensionHostModule not loaded (missing ExtensionHost.js script tag)");
    this._EH = EH;
    this._files = new Map(); // id -> { [relPath]: string|Uint8Array } (session only)
    this._registry = loadRegistry();
    this._host = new EH.ExtensionHost({ vmRunner: vmRunner() });
    this._popupSize = { width: 400, height: 300 };
  }

  RealHost.prototype._find = function (id) {
    return this._registry.find(function (m) { return m.id === id; }) || null;
  };

  RealHost.prototype._syncMeta = function (ext) {
    var action = this._host.getAction(ext.id);
    var meta = {
      id: ext.id,
      name: ext.manifest.name || "Unpacked extension",
      version: ext.manifest.version || "",
      description: ext.manifest.description || "",
      manifestVersion: ext.manifest.manifest_version,
      enabled: true,
      hasPopup: !!(action && action.defaultPopup),
      popupPath: (action && action.defaultPopup) || "",
      backgroundRan: !!ext._backgroundRan,
      backgroundError: ext._backgroundError || null,
      storageBackend: ext._storageBackend || "unknown",
      filesPresent: this._files.has(ext.id),
    };
    var i = this._registry.findIndex(function (m) { return m.id === ext.id; });
    if (i >= 0) { meta.enabled = this._registry[i].enabled !== false; this._registry[i] = meta; }
    else this._registry.unshift(meta);
    saveRegistry(this._registry);
    return meta;
  };

  // -- contract: list/get ----------------------------------------------------
  RealHost.prototype.list = function () {
    var self = this;
    return this._registry.map(function (m) {
      return {
        id: m.id, name: m.name, version: m.version, description: m.description,
        enabled: m.enabled !== false, hasPopup: !!m.hasPopup,
      };
    });
  };

  RealHost.prototype.get = function (id) {
    var m = this._find(id);
    if (!m) return null;
    // filesPresent is live session state, never the stored value.
    return Object.assign({}, m, { filesPresent: this._files.has(id) });
  };

  // -- contract: enable/disable ----------------------------------------------
  RealHost.prototype.setEnabled = async function (id, enabled) {
    var m = this._find(id);
    if (!m) return false;
    m.enabled = !!enabled;
    saveRegistry(this._registry);
    if (m.enabled && m.filesPresent) {
      try { await this._startBackground(id); }
      catch (e) { m.backgroundError = String((e && e.message) || e); saveRegistry(this._registry); }
    }
    emit();
    return true;
  };

  // Orchestrator alias for the pre-contract spec.
  RealHost.prototype.toggle = function (id) {
    var m = this._find(id);
    return this.setEnabled(id, !(m && m.enabled !== false));
  };

  // -- contract: uninstall ----------------------------------------------------
  RealHost.prototype.uninstall = async function (id) {
    this._host.unloadExtension(id);
    this._files.delete(id);
    this._registry = this._registry.filter(function (m) { return m.id !== id; });
    saveRegistry(this._registry);
    emit();
    return true;
  };

  // -- contract: loadUnpacked --------------------------------------------------
  RealHost.prototype.loadUnpacked = async function (fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) throw new Error("No files selected.");
    var manifestFile = files.find(function (f) { return /(^|\/)manifest\.json$/.test(f.webkitRelativePath || f.name); });
    if (!manifestFile) throw new Error("No manifest.json found in the selected folder.");
    var manifestPath = manifestFile.webkitRelativePath || manifestFile.name;
    var prefix = manifestPath.slice(0, manifestPath.length - "manifest.json".length);
    var rel = {};
    async function readOne(f) {
      var p = (f.webkitRelativePath || f.name);
      if (prefix && p.indexOf(prefix) === 0) p = p.slice(prefix.length);
      p = p.replace(/^\/+/, "");
      var buf = new Uint8Array(await f.arrayBuffer());
      if (/\.(json|js|mjs|html|htm|css|txt|svg|xml)$/i.test(p)) {
        rel[p] = new TextDecoder().decode(buf);
      } else {
        rel[p] = buf;
      }
    }
    for (var f of files) { await readOne(f); }
    var manifest;
    try { manifest = JSON.parse(rel["manifest.json"]); }
    catch (e) { throw new Error("manifest.json is not valid JSON."); }
    var v = this._EH.validateManifest(manifest);
    if (!v.ok) throw new Error("Invalid manifest: " + v.errors.join("; "));
    var ext = await this._host.loadManifestFiles(manifest, rel);
    this._files.set(ext.id, rel);
    var meta = this._syncMeta(ext);
    try { await this._startBackground(ext.id); }
    catch (e) { meta.backgroundError = String((e && e.message) || e); saveRegistry(this._registry); }
    this._syncMeta(ext);
    emit();
    return { id: ext.id };
  };

  RealHost.prototype._startBackground = async function (id) {
    var ext = this._host.extensions.get(id);
    if (!ext) throw new Error("unknown extension " + id);
    var res = await this._host.startBackground(ext);
    var bad = res.filter(function (r) { return !r.ok; });
    if (bad.length) throw new Error("background failed: " + bad.map(function (r) { return r.script + ": " + r.error; }).join("; "));
    return res;
  };

  // -- contract: popup ---------------------------------------------------------
  RealHost.prototype.openPopup = async function (id /*, anchorEl */) {
    var m = this._find(id);
    if (!m) throw new Error("unknown extension " + id);
    if (!m.popupPath) throw new Error(m.name + " has no popup page.");
    var files = this._files.get(id);
    var html = null;
    if (files) {
      var key = Object.keys(files).find(function (k) { return k === m.popupPath || k.endsWith("/" + m.popupPath); });
      if (key) { var v = files[key]; html = typeof v === "string" ? v : new TextDecoder().decode(v); }
    }
    if (html == null) throw new Error("Popup file was loaded in an earlier session; reload the unpacked extension to see it.");
    var render = getPopupRenderer();
    if (!render) throw new Error("Popup renderer unavailable: the engine worker must expose window.__merkavaPageEngine.renderPage.");
    var page = await render(html, this._popupSize);
    var el = document.getElementById("ext-popup");
    if (!el) throw new Error("#ext-popup element missing.");
    el.innerHTML =
      '<div class="ep-head"><span></span><button class="icon-btn ep-x" aria-label="Close">✕</button></div>' +
      '<div class="ep-body"></div>';
    el.querySelector(".ep-head span").textContent = m.name;
    el.querySelector(".ep-x").addEventListener("click", function () { window.MerkavaExtensions.closePopup(); });
    var body = el.querySelector(".ep-body");
    var canvas = document.createElement("canvas");
    canvas.width = page.width; canvas.height = page.height;
    canvas.style.maxWidth = "100%"; canvas.style.display = "block";
    var ctx = canvas.getContext("2d");
    var bytes = page.data;
    var clamped = bytes instanceof Uint8ClampedArray ? bytes : new Uint8ClampedArray(bytes.buffer || bytes, bytes.byteOffset || 0, page.width * page.height * 4);
    ctx.putImageData(new ImageData(clamped, page.width, page.height), 0, 0);
    body.appendChild(canvas);
    el.hidden = false;
    return { width: page.width, height: page.height };
  };

  RealHost.prototype.closePopup = function () {
    var el = document.getElementById("ext-popup");
    if (el) { el.hidden = true; el.innerHTML = ""; }
  };

  // -- contract: change events ---------------------------------------------------
  RealHost.prototype.on = function (ev, cb) { if (ev === "change" && cb) changeListeners.add(cb); };
  RealHost.prototype.off = function (ev, cb) { changeListeners.delete(cb); };
  // Orchestrator alias for the pre-contract spec (returns unsubscribe).
  RealHost.prototype.onChanged = function (cb) {
    this.on("change", cb);
    return function () { changeListeners.delete(cb); };
  };

  // -- non-contract helpers the app shell may use --------------------------------
  // Injectable seams (also handy in tests):
  RealHost.prototype._setPopupRenderer = function (fn) { popupRenderer = fn || null; };
  RealHost.prototype._setPopupSize = function (w, h) { this._popupSize = { width: w, height: h }; };
  // Content scripts for a URL across enabled extensions (the Navigator calls
  // this per navigation and runs the returned sources in the page's VM).
  RealHost.prototype.contentScriptsForUrl = function (url) {
    var out = [];
    var self = this;
    this._registry.forEach(function (m) {
      if (m.enabled === false || !self._files.has(m.id)) return;
      var css = self._host.getContentScriptsForUrl(m.id, url);
      css.forEach(function (c) { out.push({ extensionId: m.id, js: c.js, css: c.css, runAt: c.runAt }); });
    });
    return out;
  };
  RealHost.prototype._hostRef = function () { return this._host; };

  // -- install -------------------------------------------------------------------
  try {
    var real = new RealHost();
    real.available = true;
    window.MerkavaExtensions = real;
    if (window.console) console.log("[extensions-host] real ExtensionHost active (" + real._registry.length + " known).");
  } catch (e) {
    // Leave the sibling's local fallback in place; the UI keeps working.
    if (window.console) console.warn("[extensions-host] real host unavailable, keeping fallback:", (e && e.message) || e);
  }
})();
