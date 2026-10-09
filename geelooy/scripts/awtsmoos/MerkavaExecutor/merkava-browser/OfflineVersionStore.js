// B"H
// Boruch Hashem
/**
 * @module OfflineVersionStore
 * @description Version history for the offline-first cache.
 *
 * Yaakov: "Cache is busted when you connect to Internet and the site has
 * updates — but the page you viewed before should be kept."
 *
 * Wraps OfflinePageCache (additive — never modifies it). Before any
 * network refresh overwrites a cached entry, the current entry is
 * snapshotted into per-URL version history kept in a sidecar directory.
 * getVersion(url, n) serves any historical version with zero network.
 */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.OfflineVersionStore = factory().OfflineVersionStore; }
})(typeof self !== 'undefined' ? self : this, function() {
  function nodeRequire(name) {
    try { if (typeof require === 'function') return require(name); } catch (e) {}
    return null;
  }

  const CacheMod = nodeRequire('./OfflinePageCache.js');
  const OfflinePageCache = CacheMod ? (CacheMod.OfflinePageCache || CacheMod.offlinePageCache) : null;

  function idFor(url) {
    const crypto = nodeRequire('crypto');
    if (crypto) return crypto.createHash('sha256').update(String(url), 'utf8').digest('hex').slice(0, 24);
    let h = 0;
    const s = String(url);
    for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(16);
  }

  class OfflineVersionStore {
    constructor(options = {}) {
      if (!OfflinePageCache) throw new Error('OfflinePageCache module required');
      this.cache = options.cache || new OfflinePageCache({ persistPath: options.persistPath, maxBytes: options.maxBytes });
      const path = nodeRequire('path');
      this.versionsDir = options.versionsDir || (path ? path.join(process.cwd(), '.merkava-offline-versions') : '.merkava-offline-versions');
      this.maxVersions = options.maxVersions || 10;
    }

    _fs() { return nodeRequire('fs'); }
    _path() { return nodeRequire('path'); }

    _histFile(url) {
      const path = this._path();
      return path.join(this.versionsDir, idFor(url) + '.json');
    }

    _readHistory(url) {
      const fs = this._fs();
      try { return JSON.parse(fs.readFileSync(this._histFile(url), 'utf8')); }
      catch (e) { return { url: String(url), versions: [] }; }
    }

    _writeHistory(url, hist) {
      const fs = this._fs(), path = this._path();
      try {
        fs.mkdirSync(this.versionsDir, { recursive: true });
        fs.writeFileSync(this._histFile(url), JSON.stringify(hist));
      } catch (e) {}
    }

    /**
     * Refresh a URL from the network, archiving the previous cached copy
     * into version history first. fetchFn(url) -> Response-like.
     * Returns { updated, version, fromCache }.
     */
    async refresh(url, fetchFn) {
      const key = String(url);
      const prev = this.cache.get(key);
      if (prev) {
        const hist = this._readHistory(key);
        hist.versions.push({
          v: hist.versions.length + 1,
          archivedAt: Date.now(),
          mime: prev.mime,
          size: prev.data.length,
          etag: prev.etag,
          // Store body inline (base64) — versions are bounded by maxVersions.
          body: prev.data.toString('base64')
        });
        while (hist.versions.length > this.maxVersions) hist.versions.shift();
        this._writeHistory(key, hist);
      }
      try {
        const res = await this.cache.fetchWithCache(key, fetchFn, { silentFallback: true });
        return { updated: !res.fromCache, version: this._readHistory(key).versions.length + 1, fromCache: !!res.fromCache, data: res.data, mime: res.mime };
      } catch (e) {
        return { updated: false, fromCache: true, error: e && e.message };
      }
    }

    listVersions(url) {
      return this._readHistory(String(url)).versions.map(v => ({
        v: v.v, archivedAt: v.archivedAt, mime: v.mime, size: v.size, etag: v.etag
      }));
    }

    /**
     * Serve a historical version with zero network.
     * version: 1-based index into history, or 'latest' for the archived newest.
     */
    getVersion(url, version = 'latest') {
      const hist = this._readHistory(String(url));
      if (!hist.versions.length) return null;
      const v = version === 'latest'
        ? hist.versions[hist.versions.length - 1]
        : hist.versions.find(x => x.v === Number(version));
      if (!v) return null;
      return { data: Buffer.from(v.body, 'base64'), mime: v.mime, archivedAt: v.archivedAt, version: v.v, fromHistory: true };
    }

    /** Current (live-cache) copy, zero network. */
    getCurrent(url) { return this.cache.get(String(url)); }
    has(url) { return this.cache.has(String(url)); }
    getStats() { return Object.assign(this.cache.getStats(), { versionedUrls: this._countHistories() }); }

    _countHistories() {
      const fs = this._fs();
      try { return fs.readdirSync(this.versionsDir).filter(f => f.endsWith('.json')).length; }
      catch (e) { return 0; }
    }
  }

  return { OfflineVersionStore };
});
