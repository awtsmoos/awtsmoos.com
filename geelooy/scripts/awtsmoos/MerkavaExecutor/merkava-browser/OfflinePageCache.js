// B"H
// Boruch Hashem
// Blessed is He
//
// OfflinePageCache — offline-first page cache for the Merkava browser.
//
// Yaakov: "when visiting directly should have default offline... the page you
// viewed before should be kept."
//
// Every page you visit is snapshotted (HTML + subresources: CSS, JS, images)
// into a local content-addressed store. When the network is unavailable — or
// when the user simply revisits — the page serves from cache, fully intact.
//
// Design:
// - Snapshots are immutable and content-hashed; revisits to unchanged pages
//   cost ~0 bytes (dedup by hash).
// - LRU eviction with a byte cap keeps RAM/disk bounded.
// - Disk persistence: snapshots survive restarts.
// - Zero dependencies (Node built-ins only).
//
// Usage:
//   const cache = new OfflinePageCache({ persistPath: "./offline-cache" });
//   await cache.load();
//   const res = await cache.fetchWithCache("https://example.com/", url => fetch(url));
//   // res = { data: Buffer, mime, fromCache: bool, snapshotAt }

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.OfflinePageCache = factory().OfflinePageCache;
	}
})(typeof self !== "undefined" ? self : this, function() {

function nodeRequire(name) {
	try { if (typeof require === "function") return require(name); } catch (e) {}
	return null;
}
const fs = nodeRequire("fs");
const path = nodeRequire("path");
const crypto = nodeRequire("crypto");

function sha256hex(buf) {
	if (crypto) return crypto.createHash("sha256").update(buf).digest("hex");
	// FNV-1a fallback (non-Node hosts): good enough for dedup keys.
	let h1 = 0x811c9dc5, h2 = 0x01000193;
	const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
	for (let i = 0; i < b.length; i++) {
		h1 = Math.imul(h1 ^ b[i], 16777619) >>> 0;
		h2 = Math.imul(h2 ^ b[b.length - 1 - i], 16777619) >>> 0;
	}
	return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

function toBuffer(data) {
	if (!data) return Buffer.alloc(0);
	if (Buffer.isBuffer(data)) return data;
	if (data instanceof ArrayBuffer) return Buffer.from(data);
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	return Buffer.from(String(data), "utf8");
}

class OfflinePageCache {
	constructor(options = {}) {
		this.maxBytes = options.maxBytes || 256 * 1024 * 1024; // 256MB default
		this.persistPath = options.persistPath || null;
		// url -> { hash, mime, bytes, fetchedAt, etag, lastHit }
		this.entries = new Map();
		// hash -> { bytes, refs } content store (dedup)
		this.blobs = new Map();
		this.bytesUsed = 0;
		this.stats = { hits: 0, misses: 0, networkSaves: 0, evictions: 0 };
	}

	__blobPut(buf) {
		const hash = sha256hex(buf);
		const hit = this.blobs.get(hash);
		if (hit) { hit.refs++; return hash; }
		this.blobs.set(hash, { bytes: buf, refs: 1 });
		this.bytesUsed += buf.length;
		return hash;
	}

	__blobRelease(hash) {
		const b = this.blobs.get(hash);
		if (!b) return;
		b.refs--;
		if (b.refs <= 0) {
			this.bytesUsed -= b.bytes.length;
			this.blobs.delete(hash);
		}
	}

	__touchEvict() {
		if (this.bytesUsed <= this.maxBytes) return;
		// LRU: evict least-recently-hit entries first.
		const sorted = [...this.entries.entries()].sort((a, b) => a[1].lastHit - b[1].lastHit);
		for (const [url, e] of sorted) {
			if (this.bytesUsed <= this.maxBytes) break;
			this.__blobRelease(e.hash);
			this.entries.delete(url);
			this.stats.evictions++;
		}
	}

	/**
	 * Store a fetched resource. Returns the entry.
	 */
	put(url, data, mime = "application/octet-stream", meta = {}) {
		const buf = toBuffer(data);
		const key = String(url);
		const old = this.entries.get(key);
		if (old) this.__blobRelease(old.hash);
		const hash = this.__blobPut(buf);
		const now = Date.now();
		const entry = {
			hash,
			mime,
			size: buf.length,
			fetchedAt: now,
			lastHit: now,
			etag: meta.etag || null,
			status: meta.status || 200,
		};
		this.entries.set(key, entry);
		this.__touchEvict();
		return entry;
	}

	/**
	 * Retrieve a cached resource. Returns { data: Buffer, mime, ... } or null.
	 */
	get(url) {
		const key = String(url);
		const e = this.entries.get(key);
		if (!e) { this.stats.misses++; return null; }
		const b = this.blobs.get(e.hash);
		if (!b) { this.entries.delete(key); this.stats.misses++; return null; }
		e.lastHit = Date.now();
		this.stats.hits++;
		return { data: b.bytes, mime: e.mime, fetchedAt: e.fetchedAt, etag: e.etag, status: e.status, fromCache: true };
	}

	has(url) {
		return this.entries.has(String(url));
	}

	/**
	 * Offline-first fetch: try the network, store the result; on network
	 * failure (or when offline==true) serve the last-known-good snapshot.
	 * fetchFn(url) must return a Response-like ({ arrayBuffer(), headers, status }).
	 */
	async fetchWithCache(url, fetchFn, options = {}) {
		const key = String(url);
		const offline = !!options.offline;
		if (!offline) {
			try {
				const res = await fetchFn(key);
				const buf = Buffer.from(await res.arrayBuffer());
				const headers = {};
				try { res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; }); } catch (e) {}
				const mime = headers["content-type"] || "application/octet-stream";
				this.put(key, buf, mime, { etag: headers["etag"] || null, status: res.status });
				this.stats.networkSaves++;
				return { data: buf, mime, status: res.status, fromCache: false, fetchedAt: Date.now() };
			} catch (err) {
				// Network failed — fall through to cache.
				if (!options.silentFallback) void err;
			}
		}
		const cached = this.get(key);
		if (cached) return cached;
		throw new Error("OfflinePageCache: no cached copy of " + key + " and network unavailable");
	}

	/**
	 * Snapshot a whole page: html plus a map of subresource url -> {data, mime}.
	 */
	putPage(url, html, resources = {}) {
		const key = String(url);
		const resMap = {};
		for (const [rurl, r] of Object.entries(resources)) {
			const buf = toBuffer(r.data || r);
			const hash = this.__blobPut(buf);
			resMap[rurl] = { hash, mime: r.mime || "application/octet-stream", size: buf.length };
		}
		const htmlBuf = toBuffer(html);
		const htmlHash = this.__blobPut(htmlBuf);
		const old = this.entries.get(key + "#page");
		if (old) {
			this.__blobRelease(old.htmlHash);
			for (const r of Object.values(old.resources)) this.__blobRelease(r.hash);
		}
		const now = Date.now();
		this.entries.set(key + "#page", {
			page: true, htmlHash, resources: resMap, fetchedAt: now, lastHit: now, size: htmlBuf.length,
		});
		this.__touchEvict();
		return true;
	}

	getPage(url) {
		const key = String(url) + "#page";
		const e = this.entries.get(key);
		if (!e || !e.page) { this.stats.misses++; return null; }
		const htmlBlob = this.blobs.get(e.htmlHash);
		if (!htmlBlob) { this.stats.misses++; return null; }
		const resources = {};
		for (const [rurl, r] of Object.entries(e.resources)) {
			const b = this.blobs.get(r.hash);
			if (b) resources[rurl] = { data: b.bytes, mime: r.mime };
		}
		e.lastHit = Date.now();
		this.stats.hits++;
		return { html: htmlBlob.bytes.toString("utf8"), resources, fetchedAt: e.fetchedAt, fromCache: true };
	}

	clear() {
		this.entries.clear();
		this.blobs.clear();
		this.bytesUsed = 0;
	}

	getStats() {
		return { ...this.stats, entries: this.entries.size, blobs: this.blobs.size, bytesUsed: this.bytesUsed, maxBytes: this.maxBytes };
	}

	// ---- persistence ----

	async persist() {
		if (!this.persistPath || !fs) return false;
		try {
			fs.mkdirSync(this.persistPath, { recursive: true });
			const manifest = { entries: [], savedAt: Date.now() };
			for (const [url, e] of this.entries) {
				if (e.page) {
					const htmlBlob = this.blobs.get(e.htmlHash);
					if (!htmlBlob) continue;
					const res = {};
					for (const [rurl, r] of Object.entries(e.resources)) {
						const b = this.blobs.get(r.hash);
						if (!b) continue;
						const f = "blob-" + r.hash.slice(0, 16);
						fs.writeFileSync(path.join(this.persistPath, f), b.bytes);
						res[rurl] = { file: f, mime: r.mime, size: r.size };
					}
					const hf = "blob-" + e.htmlHash.slice(0, 16);
					fs.writeFileSync(path.join(this.persistPath, hf), htmlBlob.bytes);
					manifest.entries.push({ url, page: true, htmlFile: hf, resources: res, fetchedAt: e.fetchedAt });
				} else {
					const b = this.blobs.get(e.hash);
					if (!b) continue;
					const f = "blob-" + e.hash.slice(0, 16);
					fs.writeFileSync(path.join(this.persistPath, f), b.bytes);
					manifest.entries.push({ url, mime: e.mime, file: f, size: e.size, fetchedAt: e.fetchedAt, etag: e.etag, status: e.status });
				}
			}
			fs.writeFileSync(path.join(this.persistPath, "manifest.json"), JSON.stringify(manifest));
			return true;
		} catch (err) { return false; }
	}

	async load() {
		if (!this.persistPath || !fs) return false;
		try {
			const mpath = path.join(this.persistPath, "manifest.json");
			if (!fs.existsSync(mpath)) return false;
			const manifest = JSON.parse(fs.readFileSync(mpath, "utf8"));
			this.clear();
			for (const m of manifest.entries || []) {
				if (m.page) {
					const htmlBuf = fs.readFileSync(path.join(this.persistPath, m.htmlFile));
					const resources = {};
					for (const [rurl, r] of Object.entries(m.resources || {})) {
						const b = fs.readFileSync(path.join(this.persistPath, r.file));
						resources[rurl] = { data: b, mime: r.mime };
					}
					this.putPage(m.url.replace(/#page$/, ""), htmlBuf, resources);
				} else {
					const buf = fs.readFileSync(path.join(this.persistPath, m.file));
					this.put(m.url, buf, m.mime, { etag: m.etag, status: m.status });
				}
			}
			return true;
		} catch (err) { return false; }
	}
}

return {
	OfflinePageCache,
	offlinePageCache: OfflinePageCache,
};

});
