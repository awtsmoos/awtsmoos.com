// B"H
// Boruch Hashem
/**
 * @module PwaManager
 * @description Progressive Web App support for the Merkava browser —
 * installability beyond desktop Chrome: web app manifests, install
 * prompts, splash metadata, display modes (fullscreen/standalone/
 * minimal-ui/browser), and fully-offline installed apps backed by the
 * OfflinePageCache + ServiceWorkerHost.
 *
 * Install is fast and small: an app record is a manifest + start_url +
 * cached snapshot reference — kilobytes, not a browser profile copy.
 */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.PwaManager = factory().PwaManager; }
})(typeof self !== 'undefined' ? self : this, function() {
  function nodeRequire(name) {
    try { if (typeof require === 'function') return require(name); } catch (e) {}
    return null;
  }

  const VALID_DISPLAY = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
  const VALID_ORIENTATION = ['any', 'natural', 'landscape', 'portrait', 'portrait-primary',
    'portrait-secondary', 'landscape-primary', 'landscape-secondary'];

  function appIdFor(manifest, startUrl) {
    const crypto = nodeRequire('crypto');
    const base = (manifest.id || startUrl || manifest.start_url || manifest.name || 'app').toLowerCase();
    if (crypto) return 'merkava-' + crypto.createHash('sha256').update(base).digest('hex').slice(0, 16);
    let h = 0;
    for (let i = 0; i < base.length; i++) h = (Math.imul(h, 31) + base.charCodeAt(i)) | 0;
    return 'merkava-' + (h >>> 0).toString(16);
  }

  class PwaManager {
    constructor(options = {}) {
      const path = nodeRequire('path');
      this.dir = options.dir || (path ? path.join(process.cwd(), '.merkava-pwa-apps') : '.merkava-pwa-apps');
      this._apps = null;
    }

    _fs() { return nodeRequire('fs'); }
    _path() { return nodeRequire('path'); }

    _load() {
      if (this._apps) return this._apps;
      const fs = this._fs(), path = this._path();
      this._apps = {};
      if (!fs) return this._apps;
      try {
        const f = path.join(this.dir, 'apps.json');
        if (fs.existsSync(f)) this._apps = JSON.parse(fs.readFileSync(f, 'utf8'));
      } catch (e) { this._apps = {}; }
      return this._apps;
    }

    _save() {
      const fs = this._fs(), path = this._path();
      if (!fs) return;
      try {
        fs.mkdirSync(this.dir, { recursive: true });
        fs.writeFileSync(path.join(this.dir, 'apps.json'), JSON.stringify(this._apps, null, 1));
      } catch (e) {}
    }

    /**
     * Parse + normalize a web app manifest. Throws on invalid JSON.
     */
    parseManifest(input) {
      const raw = typeof input === 'string' ? JSON.parse(input) : (input || {});
      const m = {
        name: raw.name || raw.short_name || '',
        short_name: raw.short_name || raw.name || '',
        description: raw.description || '',
        start_url: raw.start_url || '.',
        scope: raw.scope || null,
        display: VALID_DISPLAY.includes(raw.display) ? raw.display : 'browser',
        orientation: VALID_ORIENTATION.includes(raw.orientation) ? raw.orientation : 'any',
        theme_color: raw.theme_color || '#ffffff',
        background_color: raw.background_color || '#ffffff',
        icons: Array.isArray(raw.icons) ? raw.icons.map(ic => ({
          src: ic.src || '', sizes: ic.sizes || '', type: ic.type || '', purpose: ic.purpose || 'any'
        })).filter(ic => ic.src) : [],
        screenshots: Array.isArray(raw.screenshots) ? raw.screenshots : [],
        shortcuts: Array.isArray(raw.shortcuts) ? raw.shortcuts : [],
        categories: Array.isArray(raw.categories) ? raw.categories : [],
        id: raw.id || null,
        dir: raw.dir || 'auto', lang: raw.lang || ''
      };
      if (!m.scope) {
        try {
          const u = new URL(m.start_url, 'https://localhost/');
          m.scope = u.origin + u.pathname.slice(0, u.pathname.lastIndexOf('/') + 1);
        } catch (e) { m.scope = '/'; }
      }
      return m;
    }

    /**
     * Chrome's installability criteria, plus Merkava extras.
     * Returns { installable, reasons[] }.
     */
    checkInstallable({ manifest, manifestUrl, hasServiceWorker, startUrl } = {}) {
      const reasons = [];
      let m = manifest;
      if (typeof m === 'string') { try { m = this.parseManifest(m); } catch (e) { return { installable: false, reasons: ['manifest JSON invalid: ' + e.message] }; } }
      if (!m || typeof m !== 'object') return { installable: false, reasons: ['no manifest'] };
      if (!m.name && !m.short_name) reasons.push('manifest needs name or short_name');
      if (!m.start_url) reasons.push('manifest needs start_url');
      const icon192 = (m.icons || []).some(ic => (ic.sizes || '').split(' ').some(s => {
        const mm = s.match(/(\d+)x(\d+)/); return mm && +mm[1] >= 192 && +mm[2] >= 192;
      }));
      const icon512 = (m.icons || []).some(ic => (ic.sizes || '').split(' ').some(s => {
        const mm = s.match(/(\d+)x(\d+)/); return mm && +mm[1] >= 512 && +mm[2] >= 512;
      }));
      if (!icon192) reasons.push('needs an icon >= 192px (maskable recommended)');
      if (!icon512) reasons.push('needs an icon >= 512px for splash');
      if (!hasServiceWorker) reasons.push('needs a registered service worker with a fetch handler');
      if (!m.display || m.display === 'browser') reasons.push('display should be standalone/fullscreen/minimal-ui for app feel');
      return { installable: reasons.length === 0, reasons };
    }

    /**
     * Install the app: writes a tiny app record (manifest + scope + cached
     * snapshot pointer). The installed app launches fully offline.
     */
    async install({ manifest, manifestUrl, startUrl, scope, offlineSnapshot } = {}) {
      const m = typeof manifest === 'string' ? this.parseManifest(manifest) : this.parseManifest(JSON.stringify(manifest || {}));
      if (!m.name && !m.short_name) throw new Error('cannot install: manifest has no name');
      const start = String(startUrl || manifestUrl || m.start_url || '/');
      const id = appIdFor(m, start);
      const apps = this._load();
      const app = {
        id,
        name: m.name, shortName: m.short_name, description: m.description,
        startUrl: start, scope: scope || m.scope, manifestUrl: manifestUrl || null,
        display: m.display, orientation: m.orientation,
        themeColor: m.theme_color, backgroundColor: m.background_color,
        icons: m.icons, shortcuts: m.shortcuts, categories: m.categories,
        offlineSnapshot: offlineSnapshot || null,
        installedAt: Date.now(), launchCount: 0
      };
      apps[id] = app;
      this._save();
      return app;
    }

    listInstalled() {
      const apps = this._load();
      return Object.values(apps).map(a => ({
        id: a.id, name: a.name, shortName: a.shortName, display: a.display,
        startUrl: a.startUrl, installedAt: a.installedAt, launchCount: a.launchCount
      }));
    }

    getApp(id) { return this._load()[String(id)] || null; }

    uninstall(id) {
      const apps = this._load();
      id = String(id);
      if (!apps[id]) return false;
      delete apps[id];
      this._save();
      return true;
    }

    recordLaunch(id) {
      const apps = this._load();
      const a = apps[String(id)];
      if (!a) return null;
      a.launchCount = (a.launchCount || 0) + 1;
      a.lastLaunch = Date.now();
      this._save();
      return a;
    }

    /**
     * Window configuration for launching the app in its display mode.
     */
    launchConfig(id) {
      const a = this.getApp(id);
      if (!a) return null;
      const display = a.display || 'browser';
      return {
        id: a.id, name: a.name, startUrl: a.startUrl, scope: a.scope,
        display,
        chrome: display === 'browser' ? 'full' : display === 'minimal-ui' ? 'minimal' : 'none',
        fullscreen: display === 'fullscreen',
        standalone: display === 'standalone' || display === 'fullscreen',
        themeColor: a.themeColor, backgroundColor: a.backgroundColor,
        icons: a.icons
      };
    }

    /**
     * Splash screen metadata for app launch (theme bg + largest icon).
     * The renderer can paint this natively; this returns the spec.
     */
    splashSpec(id) {
      const a = this.getApp(id);
      if (!a) return null;
      let icon = null, best = 0;
      for (const ic of (a.icons || [])) {
        for (const s of String(ic.sizes || '').split(' ')) {
          const mm = s.match(/(\d+)x(\d+)/);
          if (mm && +mm[1] * +mm[2] > best) { best = +mm[1] * +mm[2]; icon = ic; }
        }
      }
      return {
        backgroundColor: a.backgroundColor || '#ffffff',
        name: a.name, shortName: a.shortName,
        icon: icon ? icon.src : null, iconSizes: icon ? icon.sizes : null,
        themeColor: a.themeColor
      };
    }

    /**
     * beforeinstallprompt flow: returns { prompt(), userChoice }.
     * prompt() resolves with { outcome: 'accepted'|'dismissed', app }.
     */
    createInstallPrompt({ manifest, manifestUrl, startUrl, scope, autoAccept } = {}) {
      const mgr = this;
      let settled = false;
      let resolveChoice;
      const userChoice = new Promise(res => { resolveChoice = res; });
      return {
        userChoice,
        async prompt(accept) {
          if (settled) return userChoice;
          settled = true;
          const outcome = (accept !== undefined ? accept : autoAccept !== false) ? 'accepted' : 'dismissed';
          let app = null;
          if (outcome === 'accepted') {
            app = await mgr.install({ manifest, manifestUrl, startUrl, scope });
          }
          resolveChoice({ outcome, app });
          return { outcome, app };
        }
      };
    }

    /**
     * Storage footprint of installed apps (app records only — snapshots
     * live in the OfflinePageCache and are shared).
     */
    storageEstimate() {
      const fs = this._fs(), path = this._path();
      let bytes = 0;
      try {
        const f = path.join(this.dir, 'apps.json');
        if (fs.existsSync(f)) bytes = fs.statSync(f).size;
      } catch (e) {}
      return { bytes, apps: this.listInstalled().length, note: 'page snapshots shared with OfflinePageCache' };
    }
  }

  return { PwaManager };
});
