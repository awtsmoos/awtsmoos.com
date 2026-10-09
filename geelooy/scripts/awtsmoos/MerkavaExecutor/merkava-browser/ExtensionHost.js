// B"H
// Boruch Hashem
/**
 * @module ExtensionHost
 * @description Chrome extension system for the Merkava browser (mobile-ready).
 *
 * Loads unpacked extensions or .crx files (CRX3), validates manifest v2/v3,
 * runs background scripts/service workers through the real Merkava VM
 * (never V8 executing guest code), injects content scripts by match
 * patterns, and provides a working chrome.* API: storage (disk-backed),
 * runtime, tabs (virtual), alarms, action/browserAction, notifications,
 * contextMenus, scripting.
 */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.ExtensionHost = factory().ExtensionHost; }
})(typeof self !== 'undefined' ? self : this, function() {
  function nodeRequire(name) {
    try { if (typeof require === 'function') return require(name); } catch (e) {}
    return null;
  }

  const VmRunner = nodeRequire('./VmScriptRunner.js');
  const runVmScript = VmRunner ? VmRunner.VmScriptRunner.runVmScript : null;

  /* ---------------------------------------------------------------- */
  /* Match patterns: "*://*.example.com/*", "<all_urls>"               */
  /* ---------------------------------------------------------------- */

  function patternToRegExp(pattern) {
    if (pattern === '<all_urls>') return /^(https?|file|ftp):\/\/.+/i;
    // scheme://host/path
    const m = String(pattern).match(/^(\*|https?|file|ftp):\/\/([^/]*)(\/.*)$/i);
    if (!m) return null;
    let [, scheme, host, pathPart] = m;
    const esc = s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    let hostRe;
    if (host === '*' || host === '') hostRe = '[^/]+';
    else if (host.startsWith('*.')) hostRe = '([^/]+\\.)?' + esc(host.slice(2));
    else hostRe = esc(host);
    const schemeRe = scheme === '*' ? 'https?' : esc(scheme);
    return new RegExp('^' + schemeRe + ':\\/\\/' + hostRe + esc(pathPart) + '$', 'i');
  }

  function urlMatches(url, patterns) {
    const list = Array.isArray(patterns) ? patterns : [patterns];
    for (const p of list) {
      if (p === '<all_urls>') return true;
      const re = patternToRegExp(p);
      if (re && re.test(String(url))) return true;
      if (!re && String(url).startsWith(String(p))) return true;
    }
    return false;
  }

  /* ---------------------------------------------------------------- */
  /* CRX3 parsing: magic + header skip, then a plain zip.              */
  /* ---------------------------------------------------------------- */

  function parseCrx(buffer) {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    if (buf.length < 16) throw new Error('CRX too small');
    if (buf.toString('ascii', 0, 4) !== 'Cr24') throw new Error('Not a CRX file (bad magic)');
    const version = buf.readUInt32LE(4);
    if (version !== 3 && version !== 2) throw new Error('Unsupported CRX version ' + version);
    let zipOffset;
    if (version === 3) {
      const headerLen = buf.readUInt32LE(8);
      zipOffset = 12 + headerLen;
    } else {
      const pubLen = buf.readUInt32LE(8), sigLen = buf.readUInt32LE(12);
      zipOffset = 16 + pubLen + sigLen;
    }
    return unzip(buf.slice(zipOffset));
  }

  // Minimal zip reader: stored (0) + deflated (8) entries.
  function unzip(zipBuf) {
    const zlib = nodeRequire('zlib');
    const files = {};
    let off = 0;
    while (off + 30 <= zipBuf.length) {
      if (zipBuf.readUInt32LE(off) !== 0x04034b50) break;
      const method = zipBuf.readUInt16LE(off + 8);
      const compSize = zipBuf.readUInt32LE(off + 18);
      const nameLen = zipBuf.readUInt16LE(off + 26);
      const extraLen = zipBuf.readUInt16LE(off + 28);
      const name = zipBuf.toString('utf8', off + 30, off + 30 + nameLen);
      const dataStart = off + 30 + nameLen + extraLen;
      const comp = zipBuf.slice(dataStart, dataStart + compSize);
      let data;
      if (method === 0) data = comp;
      else if (method === 8) {
        if (!zlib) throw new Error('zlib needed for deflated zip entries');
        data = zlib.inflateRawSync(comp);
      } else throw new Error('Unsupported zip method ' + method + ' for ' + name);
      if (!name.endsWith('/')) files[name] = data;
      off = dataStart + compSize;
    }
    if (!Object.keys(files).length) throw new Error('No files found in zip');
    return files;
  }

  /* ---------------------------------------------------------------- */
  /* Manifest validation.                                              */
  /* ---------------------------------------------------------------- */

  function validateManifest(manifest) {
    const errors = [];
    const m = manifest || {};
    if (typeof m !== 'object') errors.push('manifest must be an object');
    if (!m.name) errors.push('manifest.name is required');
    if (!m.version) errors.push('manifest.version is required');
    const mv = Number(m.manifest_version);
    if (mv !== 2 && mv !== 3) errors.push('manifest_version must be 2 or 3');
    if (mv === 3 && m.background && m.background.scripts) errors.push('MV3 uses background.service_worker, not background.scripts');
    if (mv === 3 && m.browser_action) errors.push('MV3 uses action, not browser_action');
    return { ok: errors.length === 0, errors, manifestVersion: mv };
  }

  /* ---------------------------------------------------------------- */
  /* The chrome.* API.                                                 */
  /* ---------------------------------------------------------------- */

  function createChromeApi(ext, host) {
    const fs = nodeRequire('fs'), path = nodeRequire('path');
    const storeDir = ext.storeDir;
    if (fs && storeDir) try { fs.mkdirSync(storeDir, { recursive: true }); } catch (e) {}

    function loadArea(area) {
      if (!fs || !storeDir) return {};
      try { return JSON.parse(fs.readFileSync(path.join(storeDir, 'storage-' + area + '.json'), 'utf8')); }
      catch (e) { return {}; }
    }
    function saveArea(area, data) {
      if (!fs || !storeDir) return;
      try { fs.writeFileSync(path.join(storeDir, 'storage-' + area + '.json'), JSON.stringify(data)); } catch (e) {}
    }
    const changeListeners = [];
    function makeStorageArea(area) {
      return {
        get(keys, cb) {
          const data = loadArea(area);
          let out;
          if (keys === null || keys === undefined) out = Object.assign({}, data);
          else if (typeof keys === 'string') out = { [keys]: data[keys] };
          else if (Array.isArray(keys)) { out = {}; for (const k of keys) out[k] = data[k]; }
          else { out = {}; for (const [k, def] of Object.entries(keys)) out[k] = data[k] === undefined ? def : data[k]; }
          if (typeof cb === 'function') cb(out);
          return Promise.resolve(out);
        },
        set(items, cb) {
          const data = loadArea(area);
          const changes = {};
          for (const [k, v] of Object.entries(items || {})) {
            changes[k] = { oldValue: data[k], newValue: v };
            data[k] = v;
          }
          saveArea(area, data);
          for (const l of changeListeners.slice()) try { l(changes, area); } catch (e) {}
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
        remove(keys, cb) {
          const data = loadArea(area);
          for (const k of (Array.isArray(keys) ? keys : [keys])) delete data[k];
          saveArea(area, data);
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
        clear(cb) { saveArea(area, {}); if (typeof cb === 'function') cb(); return Promise.resolve(); },
        onChanged: { addListener(fn) { if (fn) changeListeners.push(fn); } }
      };
    }

    const msgListeners = [];
    const alarmListeners = [];
    const actionClickListeners = [];
    const menuClickListeners = [];
    const alarms = new Map();
    const menus = new Map();
    let menuSeq = 0;
    const badge = { text: '', title: '' };

    const chrome = {
      storage: {
        local: makeStorageArea('local'),
        sync: makeStorageArea('sync'),
        managed: makeStorageArea('managed'),
        onChanged: { addListener(fn) { if (fn) changeListeners.push(fn); } }
      },
      runtime: {
        id: ext.id,
        getManifest() { return JSON.parse(JSON.stringify(ext.manifest)); },
        getURL(p) { return 'chrome-extension://' + ext.id + '/' + String(p || '').replace(/^\//, ''); },
        sendMessage(msg, cb) {
          for (const l of msgListeners.slice()) { try { l(msg, { id: ext.id }, typeof cb === 'function' ? cb : () => {}); } catch (e) {} }
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
        onMessage: { addListener(fn) { if (fn) msgListeners.push(fn); } },
        onInstalled: { addListener() {} },
        onStartup: { addListener() {} },
        lastError: null,
        openOptionsPage() { host._openPage(ext, ext.manifest.options_page || ext.manifest.options_ui && ext.manifest.options_ui.page); }
      },
      tabs: {
        query(q, cb) {
          const tabs = host._tabs.filter(t => {
            if (q && q.active !== undefined && t.active !== q.active) return false;
            if (q && q.url && !urlMatches(t.url, q.url)) return false;
            return true;
          }).map(t => Object.assign({}, t));
          if (typeof cb === 'function') cb(tabs);
          return Promise.resolve(tabs);
        },
        create(props, cb) {
          const tab = host._createTab(props && props.url);
          if (typeof cb === 'function') cb(Object.assign({}, tab));
          return Promise.resolve(Object.assign({}, tab));
        },
        update(id, props, cb) {
          const tab = host._tabs.find(t => t.id === id);
          if (tab && props && props.url) tab.url = props.url;
          if (typeof cb === 'function') cb(tab ? Object.assign({}, tab) : null);
          return Promise.resolve(tab);
        },
        remove(ids, cb) {
          for (const id of (Array.isArray(ids) ? ids : [ids])) host._tabs = host._tabs.filter(t => t.id !== id);
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
        sendMessage(id, msg, cb) {
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        },
        onUpdated: { addListener() {} }
      },
      alarms: {
        create(name, info) {
          if (typeof name === 'object') { info = name; name = ''; }
          name = String(name || '');
          const old = alarms.get(name);
          if (old) clearTimeout(old.timer);
          const ms = info && info.when ? Math.max(0, info.when - Date.now())
            : info && info.delayInMinutes ? info.delayInMinutes * 60000
            : info && info.periodInMinutes ? info.periodInMinutes * 60000 : 60000;
          const timer = setTimeout(() => {
            for (const l of alarmListeners.slice()) try { l({ name, scheduledTime: Date.now() }); } catch (e) {}
            if (info && info.periodInMinutes) chrome.alarms.create(name, info);
            else alarms.delete(name);
          }, ms);
          if (timer.unref) timer.unref();
          alarms.set(name, { name, timer, info: info || {} });
        },
        get(name, cb) { const a = alarms.get(String(name)); const out = a ? { name: a.name, scheduledTime: Date.now() } : undefined; if (typeof cb === 'function') cb(out); return Promise.resolve(out); },
        getAll(cb) { const out = [...alarms.keys()].map(name => ({ name })); if (typeof cb === 'function') cb(out); return Promise.resolve(out); },
        clear(name, cb) { const a = alarms.get(String(name)); if (a) clearTimeout(a.timer); const ok = alarms.delete(String(name)); if (typeof cb === 'function') cb(ok); return Promise.resolve(ok); },
        onAlarm: { addListener(fn) { if (fn) alarmListeners.push(fn); } }
      },
      action: {
        setBadgeText(d, cb) { badge.text = (d && d.text) || ''; if (typeof cb === 'function') cb(); return Promise.resolve(); },
        getBadgeText(d, cb) { if (typeof cb === 'function') cb(badge.text); return Promise.resolve(badge.text); },
        setTitle(d, cb) { badge.title = (d && d.title) || ''; if (typeof cb === 'function') cb(); return Promise.resolve(); },
        onClicked: { addListener(fn) { if (fn) actionClickListeners.push(fn); } },
        _click(tab) { for (const l of actionClickListeners.slice()) try { l(tab); } catch (e) {} }
      },
      notifications: {
        create(id, opts, cb) {
          if (typeof id === 'object') { cb = opts; opts = id; id = 'n' + Date.now(); }
          host._notifications.set(String(id), opts || {});
          if (host.options.notificationHost && typeof host.options.notificationHost.show === 'function') {
            try { host.options.notificationHost.show(Object.assign({ id }, opts)); } catch (e) {}
          }
          if (typeof cb === 'function') cb(String(id));
          return Promise.resolve(String(id));
        },
        clear(id, cb) { const ok = host._notifications.delete(String(id)); if (typeof cb === 'function') cb(ok); return Promise.resolve(ok); },
        getAll(cb) { const out = {}; for (const [k, v] of host._notifications) out[k] = v; if (typeof cb === 'function') cb(out); return Promise.resolve(out); }
      },
      contextMenus: {
        create(props, cb) {
          const id = (props && props.id) || ('menu-' + (++menuSeq));
          menus.set(String(id), Object.assign({ id: String(id) }, props));
          if (typeof cb === 'function') cb(String(id));
          return String(id);
        },
        removeAll(cb) { menus.clear(); if (typeof cb === 'function') cb(); return Promise.resolve(); },
        onClicked: { addListener(fn) { if (fn) menuClickListeners.push(fn); } },
        _click(info, tab) { for (const l of menuClickListeners.slice()) try { l(info, tab); } catch (e) {} }
      },
      scripting: {
        executeScript(details, cb) {
          const out = host._executeScript(details);
          if (typeof cb === 'function') cb(out);
          return Promise.resolve(out);
        },
        registerContentScripts(scripts, cb) {
          for (const s of (scripts || [])) ext._dynamicContentScripts.push(s);
          if (typeof cb === 'function') cb();
          return Promise.resolve();
        }
      }
    };
    // MV2 alias.
    chrome.browserAction = chrome.action;
    return chrome;
  }

  /* ---------------------------------------------------------------- */
  /* ExtensionHost                                                     */
  /* ---------------------------------------------------------------- */

  class ExtensionHost {
    constructor(options = {}) {
      this.options = options;
      const path = nodeRequire('path');
      this.dataDir = options.dataDir || (path ? path.join(process.cwd(), '.merkava-extensions') : '.merkava-extensions');
      this.extensions = new Map(); // id -> ext record
      this._tabs = [];
      this._tabSeq = 0;
      this._notifications = new Map();
    }

    _extId(manifest) {
      const crypto = nodeRequire('crypto');
      const base = (manifest.name || 'ext') + '@' + (manifest.version || '0');
      if (crypto) return crypto.createHash('sha256').update(base).digest('hex').slice(0, 32);
      let h = 0;
      for (let i = 0; i < base.length; i++) h = (Math.imul(h, 31) + base.charCodeAt(i)) | 0;
      return 'ext' + (h >>> 0).toString(16);
    }

    _createTab(url) {
      const tab = { id: ++this._tabSeq, url: String(url || 'about:blank'), active: true, title: '' };
      this._tabs.push(tab);
      return tab;
    }

    _openPage(ext, page) {
      if (!page) return null;
      return 'chrome-extension://' + ext.id + '/' + String(page).replace(/^\//, '');
    }

    _executeScript(details) {
      // Records the injection; actual execution happens in the page's VM context.
      return [{ frameId: 0, result: null, injected: true, files: details.files || [], target: details.target || null }];
    }

    async loadManifestFiles(manifest, files) {
      const v = validateManifest(manifest);
      if (!v.ok) throw new Error('Invalid extension manifest: ' + v.errors.join('; '));
      const path = nodeRequire('path');
      const id = this._extId(manifest);
      const storeDir = path ? path.join(this.dataDir, id) : null;
      const ext = {
        id, manifest: JSON.parse(JSON.stringify(manifest)), files: files || {},
        storeDir, _dynamicContentScripts: [], _backgroundRan: false, _chrome: null
      };
      ext._chrome = createChromeApi(ext, this);
      this.extensions.set(id, ext);
      return ext;
    }

    async loadUnpacked(dirPath) {
      const fs = nodeRequire('fs'), path = nodeRequire('path');
      if (!fs) throw new Error('loadUnpacked needs node fs');
      const files = {};
      const walk = (d, prefix) => {
        for (const name of fs.readdirSync(d)) {
          const full = path.join(d, name);
          const rel = prefix ? prefix + '/' + name : name;
          const st = fs.statSync(full);
          if (st.isDirectory()) walk(full, rel);
          else files[rel] = fs.readFileSync(full);
        }
      };
      walk(dirPath, '');
      const manifestRaw = files['manifest.json'];
      if (!manifestRaw) throw new Error('manifest.json missing in ' + dirPath);
      return this.loadManifestFiles(JSON.parse(manifestRaw.toString('utf8')), files);
    }

    async loadCrx(buffer) {
      const files = parseCrx(buffer);
      const manifestRaw = files['manifest.json'];
      if (!manifestRaw) throw new Error('manifest.json missing in CRX');
      return this.loadManifestFiles(JSON.parse(manifestRaw.toString('utf8')), files);
    }

    /**
     * Run background scripts (MV2) or the service worker (MV3) in the
     * Merkava VM with the chrome.* API available as a global.
     */
    async startBackground(extId) {
      if (!runVmScript) throw new Error('VmScriptRunner unavailable');
      const ext = typeof extId === 'string' ? this.extensions.get(extId) : extId;
      if (!ext) throw new Error('unknown extension');
      const mv = Number(ext.manifest.manifest_version);
      const scripts = [];
      if (mv === 3) {
        const sw = ext.manifest.background && ext.manifest.background.service_worker;
        if (sw) scripts.push(sw);
      } else {
        const bg = ext.manifest.background;
        if (bg && Array.isArray(bg.scripts)) scripts.push(...bg.scripts);
        else if (typeof bg === 'string') scripts.push(bg);
      }
      const results = [];
      for (const name of scripts) {
        const src = ext.files[name] || ext.files[name.replace(/^\//, '')];
        if (!src) { results.push({ script: name, ok: false, error: 'missing file' }); continue; }
        const selfObj = { chrome: ext._chrome };
        const globals = { chrome: ext._chrome, console, self: selfObj };
        try { globals.URL = URL; } catch (e) {}
        globals.setTimeout = setTimeout; globals.clearTimeout = clearTimeout;
        globals.setInterval = setInterval; globals.clearInterval = clearInterval;
        const r = await runVmScript(src.toString('utf8'), { label: 'ext:' + ext.id + ':' + name, globals, cycles: 60000 });
        results.push({ script: name, ok: r.status === 'COMPLETED', error: r.error || null });
        ext._backgroundRan = ext._backgroundRan || r.status === 'COMPLETED';
      }
      return results;
    }

    /**
     * Content scripts whose match patterns cover `url`, in manifest order.
     * Returns [{ js: [sources], css: [sources], runAt, allFrames }].
     */
    getContentScriptsForUrl(extId, url) {
      const ext = typeof extId === 'string' ? this.extensions.get(extId) : extId;
      if (!ext) return [];
      const out = [];
      const all = [].concat(ext.manifest.content_scripts || [], ext._dynamicContentScripts || []);
      for (const cs of all) {
        const matches = cs.matches || [];
        const exclude = cs.exclude_matches || [];
        if (!urlMatches(url, matches)) continue;
        if (exclude.length && urlMatches(url, exclude)) continue;
        const js = [], css = [];
        for (const f of (cs.js || [])) {
          const src = ext.files[f] || ext.files[f.replace(/^\//, '')];
          if (src) js.push(src.toString('utf8'));
        }
        for (const f of (cs.css || [])) {
          const src = ext.files[f] || ext.files[f.replace(/^\//, '')];
          if (src) css.push(src.toString('utf8'));
        }
        out.push({ js, css, runAt: cs.run_at || 'document_idle', allFrames: !!cs.all_frames });
      }
      return out;
    }

    /**
     * Popup / options page source for rendering through the page pipeline.
     */
    getExtensionPage(extId, pagePath) {
      const ext = typeof extId === 'string' ? this.extensions.get(extId) : extId;
      if (!ext) return null;
      const key = String(pagePath || '').replace(/^\//, '');
      const f = ext.files[key];
      return f ? f.toString('utf8') : null;
    }

    getAction(extId) {
      const ext = typeof extId === 'string' ? this.extensions.get(extId) : extId;
      if (!ext) return null;
      const mv = Number(ext.manifest.manifest_version);
      const def = mv === 3 ? ext.manifest.action : ext.manifest.browser_action;
      if (!def) return null;
      return {
        defaultTitle: def.default_title || ext.manifest.name,
        defaultPopup: def.default_popup || null,
        defaultIcon: def.default_icon || null
      };
    }

    listExtensions() {
      return [...this.extensions.values()].map(e => ({
        id: e.id, name: e.manifest.name, version: e.manifest.version,
        manifestVersion: e.manifest.manifest_version, backgroundRan: e._backgroundRan
      }));
    }

    unloadExtension(extId) {
      const id = typeof extId === 'string' ? extId : extId.id;
      return this.extensions.delete(id);
    }
  }

  return {
    ExtensionHost,
    validateManifest,
    patternToRegExp,
    urlMatches,
    parseCrx,
    createChromeApi
  };
});
