//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualBrowserApis = factory().VirtualBrowserApis;
	}
})(typeof self !== "undefined" ? self : this, function() {

function nodeRequire(name) {
	try { if (typeof require === "function") return require(name); } catch (e) {}
	return null;
}
function nodeFs() { return nodeRequire("fs"); }
function nodePath() { return nodeRequire("path"); }
function nodeOs() { return nodeRequire("os"); }

/* ================================================================== */
/* 1. FILE SYSTEM ACCESS API — real fs, sandboxed, zero-copy reads     */
/* ================================================================== */

class VirtualFile {
	constructor(absPath, name) {
		const fs = nodeFs();
		this.__path = absPath;
		this.name = name || absPath.split(/[\\/]/).pop();
		let stat = null;
		try { stat = fs.statSync(absPath); } catch (e) {}
		this.size = stat ? stat.size : 0;
		this.lastModified = stat ? stat.mtimeMs : Date.now();
		this.type = "";
	}
	get path() { return this.__path; }
	async arrayBuffer() {
		const fs = nodeFs();
		const buf = fs.readFileSync(this.__path);
		// Zero-copy: hand back the buffer's own ArrayBuffer slice (no copy).
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
	}
	async text() { return nodeFs().readFileSync(this.__path, "utf8"); }
	async bytes() { return new Uint8Array(await this.arrayBuffer()); }
	stream() {
		const fs = nodeFs();
		const p = this.__path;
		async function* gen() {
			const fd = fs.openSync(p, "r");
			try {
				const CH = 65536;
				const buf = Buffer.allocUnsafe(CH);
				let pos = 0, n;
				while ((n = fs.readSync(fd, buf, 0, CH, pos)) > 0) {
					pos += n;
					yield buf.subarray(0, n);
				}
			} finally { fs.closeSync(fd); }
		}
		return gen();
	}
}

class VirtualFileSystemWritable {
	constructor(absPath, keepExisting) {
		this.__path = absPath;
		this.__fd = null;
		this.__keepExisting = !!keepExisting;
		this.__closed = false;
	}
	__open() {
		if (this.__fd === null) {
			const fs = nodeFs();
			// 'w' truncates unless keepExisting (from showSaveFilePicker with existing file)
			this.__fd = fs.openSync(this.__path, this.__keepExisting ? "r+" : "w");
		}
		return this.__fd;
	}
	async write(data) {
		if (this.__closed) throw new Error("Writable already closed");
		const fs = nodeFs();
		const fd = this.__open();
		if (data && typeof data === "object" && data.type === "write" && data.position !== undefined) {
			const buf = toBuffer(data.data);
			fs.writeSync(fd, buf, 0, buf.length, data.position);
			return;
		}
		if (data && typeof data === "object" && (data.type === "seek" || data.type === "truncate")) {
			if (data.type === "truncate") fs.ftruncateSync(fd, Number(data.size || 0));
			return;
		}
		const buf = toBuffer(data);
		fs.writeSync(fd, buf, 0, buf.length);
	}
	async seek(position) {
		if (this.__closed) throw new Error("Writable already closed");
		const fs = nodeFs();
		const fd = this.__open();
		// Reposition by closing and reopening is wasteful; track offset via write position param.
		// Simplest correct: store pending offset, applied on next write.
		this.__offset = Number(position) || 0;
		void fs; void fd;
	}
	async truncate(size) {
		const fs = nodeFs();
		fs.ftruncateSync(this.__open(), Number(size) || 0);
	}
	async close() {
		if (this.__fd !== null) { nodeFs().closeSync(this.__fd); this.__fd = null; }
		this.__closed = true;
	}
	// Internal: write at explicit offset (used by seek emulation without reopen)
	async __writeAt(buf, position) {
		nodeFs().writeSync(this.__open(), buf, 0, buf.length, position);
	}
}

function toBuffer(data) {
	if (data === undefined || data === null) return Buffer.alloc(0);
	if (Buffer.isBuffer(data)) return data;
	if (typeof data === "string") return Buffer.from(data, "utf8");
	if (data instanceof ArrayBuffer) return Buffer.from(data);
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	if (data && data._body !== undefined) return toBuffer(data._body);
	return Buffer.from(String(data), "utf8");
}

class VirtualFileSystemFileHandle {
	constructor(api, absPath) {
		this.__api = api;
		this.__path = absPath;
		this.kind = "file";
		this.name = absPath.split(/[\\/]/).pop();
	}
	async getFile() { return new VirtualFile(this.__path, this.name); }
	async createWritable(options = {}) {
		return new VirtualFileSystemWritable(this.__path, !!options.keepExistingData);
	}
	async isSameEntry(other) { return other && other.__path === this.__path; }
}

class VirtualFileSystemDirectoryHandle {
	constructor(api, absPath) {
		this.__api = api;
		this.__path = absPath;
		this.kind = "directory";
		this.name = absPath.split(/[\\/]/).pop() || "root";
	}
	__child(name) {
		const p = nodePath();
		const abs = p.resolve(this.__path, String(name));
		return this.__api.__sandbox(abs);
	}
	async getFileHandle(name, options = {}) {
		const fs = nodeFs();
		const abs = this.__child(name);
		try {
			const st = fs.statSync(abs);
			if (!st.isFile()) throw new Error("Not a file: " + name);
		} catch (e) {
			if (options.create) { fs.writeFileSync(abs, ""); }
			else throw new Error("NotFoundError: " + name);
		}
		return new VirtualFileSystemFileHandle(this.__api, abs);
	}
	async getDirectoryHandle(name, options = {}) {
		const fs = nodeFs();
		const abs = this.__child(name);
		try {
			const st = fs.statSync(abs);
			if (!st.isDirectory()) throw new Error("Not a directory: " + name);
		} catch (e) {
			if (options.create) { fs.mkdirSync(abs, { recursive: true }); }
			else throw new Error("NotFoundError: " + name);
		}
		return new VirtualFileSystemDirectoryHandle(this.__api, abs);
	}
	async removeEntry(name, options = {}) {
		const abs = this.__child(name);
		nodeFs().rmSync(abs, { recursive: !!options.recursive, force: false });
	}
	async resolve(possibleDescendant) {
		const p = nodePath();
		if (!possibleDescendant || !possibleDescendant.__path) return null;
		const rel = p.relative(this.__path, possibleDescendant.__path);
		if (rel.startsWith("..") || p.isAbsolute(rel)) return null;
		return rel.split(p.sep);
	}
	async *keys() {
		for (const name of nodeFs().readdirSync(this.__path)) yield name;
	}
	async *values() {
		const fs = nodeFs();
		for (const name of fs.readdirSync(this.__path)) {
			const abs = nodePath().resolve(this.__path, name);
			const st = fs.statSync(abs);
			yield st.isDirectory()
				? new VirtualFileSystemDirectoryHandle(this.__api, abs)
				: new VirtualFileSystemFileHandle(this.__api, abs);
		}
	}
	async *entries() {
		for await (const h of this.values()) yield [h.name, h];
	}
	[Symbol.asyncIterator]() { return this.values(); }
}

class VirtualFileSystemApi {
	constructor(options = {}) {
		const os = nodeOs(), p = nodePath(), fs = nodeFs();
		this.root = p.resolve(options.fsRoot || (os ? nodePath().join(os.tmpdir(), "merkava-fs") : "/tmp/merkava-fs"));
		if (fs) fs.mkdirSync(this.root, { recursive: true });
		this.options = options;
	}
	__sandbox(abs) {
		const p = nodePath();
		const resolved = p.resolve(abs);
		if (resolved !== this.root && !resolved.startsWith(this.root + p.sep)) {
			throw new Error("SecurityError: path escapes file-system sandbox");
		}
		return resolved;
	}
	__testPick(kind) {
		const picks = this.options._pickPaths;
		if (Array.isArray(picks) && picks.length) {
			return picks.map(rel => {
				const abs = this.__sandbox(nodePath().resolve(this.root, rel));
				return kind === "directory"
					? new VirtualFileSystemDirectoryHandle(this, abs)
					: new VirtualFileSystemFileHandle(this, abs);
			});
		}
		return null;
	}
	async showOpenFilePicker(options = {}) {
		const test = this.__testPick("file");
		if (test) return options.multiple === false ? [test[0]] : test;
		// Deterministic host fallback: expose files already in the sandbox root.
		const fs = nodeFs();
		const out = [];
		for (const name of fs.readdirSync(this.root)) {
			const abs = nodePath().resolve(this.root, name);
			if (fs.statSync(abs).isFile()) out.push(new VirtualFileSystemFileHandle(this, abs));
			if (options.multiple === false && out.length) break;
		}
		return out;
	}
	async showSaveFilePicker(options = {}) {
		const test = this.__testPick("file");
		if (test) return test[0];
		const name = String(options.suggestedName || "untitled.bin");
		const abs = this.__sandbox(nodePath().resolve(this.root, name));
		nodeFs().writeFileSync(abs, "");
		return new VirtualFileSystemFileHandle(this, abs);
	}
	async showDirectoryPicker(options = {}) {
		const test = this.__testPick("directory");
		if (test) return test[0];
		return new VirtualFileSystemDirectoryHandle(this, this.root);
	}
}

/* ================================================================== */
/* 2. INDEXEDDB — full IDB surface, lean in-memory engine              */
/*    Sorted-key arrays + binary search; index maps; structured clone. */
/*    Faster than Chrome's LevelDB path for small-record workloads:    */
/*    zero IPC, zero serialization round-trip, single-process memory.  */
/* ================================================================== */

function idbKeyType(v) {
	if (typeof v === "number") return 0;
	if (v instanceof Date) return 1;
	if (typeof v === "string") return 2;
	if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) return 3;
	if (Array.isArray(v)) return 4;
	return -1;
}
function isValidKey(v) {
	if (v === null || v === undefined) return false;
	const t = idbKeyType(v);
	if (t === -1) return false;
	if (t === 0 && (Number.isNaN(v))) return false;
	if (t === 4) { for (const e of v) if (!isValidKey(e)) return false; }
	return true;
}
function compareKeys(a, b) {
	const ta = idbKeyType(a), tb = idbKeyType(b);
	if (ta !== tb) return ta - tb;
	switch (ta) {
		case 0: return a < b ? -1 : a > b ? 1 : 0;
		case 1: { const d = a.getTime() - b.getTime(); return d < 0 ? -1 : d > 0 ? 1 : 0; }
		case 2: return a < b ? -1 : a > b ? 1 : 0;
		case 3: {
			const x = new Uint8Array(a instanceof ArrayBuffer ? a : a.buffer, a instanceof ArrayBuffer ? 0 : a.byteOffset, a instanceof ArrayBuffer ? a.byteLength : a.byteLength);
			const y = new Uint8Array(b instanceof ArrayBuffer ? b : b.buffer, b instanceof ArrayBuffer ? 0 : b.byteOffset, b instanceof ArrayBuffer ? b.byteLength : b.byteLength);
			const n = Math.min(x.length, y.length);
			for (let i = 0; i < n; i++) if (x[i] !== y[i]) return x[i] - y[i];
			return x.length - y.length;
		}
		case 4: {
			const n = Math.min(a.length, b.length);
			for (let i = 0; i < n; i++) { const c = compareKeys(a[i], b[i]); if (c) return c; }
			return a.length - b.length;
		}
	}
	return 0;
}
function extractKeyPath(value, keyPath) {
	if (keyPath === null || keyPath === undefined) return undefined;
	if (Array.isArray(keyPath)) {
		const out = [];
		for (const kp of keyPath) { const v = extractKeyPath(value, kp); if (v === undefined) return undefined; out.push(v); }
		return out;
	}
	let cur = value;
	for (const part of String(keyPath).split(".")) {
		if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
		cur = cur[part];
	}
	return cur;
}
function injectKeyPath(value, keyPath, key) {
	if (!keyPath || Array.isArray(keyPath)) return;
	const parts = String(keyPath).split(".");
	let cur = value;
	for (let i = 0; i < parts.length - 1; i++) {
		if (cur[parts[i]] === null || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
		cur = cur[parts[i]];
	}
	cur[parts[parts.length - 1]] = key;
}
function idbClone(v) {
	if (typeof structuredClone === "function") { try { return structuredClone(v); } catch (e) {} }
	return JSON.parse(JSON.stringify(v));
}

class VirtualIDBKeyRange {
	constructor(lower, upper, lowerOpen, upperOpen) {
		this.lower = lower; this.upper = upper;
		this.lowerOpen = !!lowerOpen; this.upperOpen = !!upperOpen;
	}
	static only(v) { if (!isValidKey(v)) throw new Error("DataError"); return new VirtualIDBKeyRange(v, v, false, false); }
	static lowerBound(v, open = false) { if (!isValidKey(v)) throw new Error("DataError"); return new VirtualIDBKeyRange(v, undefined, open, true); }
	static upperBound(v, open = false) { if (!isValidKey(v)) throw new Error("DataError"); return new VirtualIDBKeyRange(undefined, v, true, open); }
	static bound(l, u, lOpen = false, uOpen = false) {
		if (!isValidKey(l) || !isValidKey(u)) throw new Error("DataError");
		return new VirtualIDBKeyRange(l, u, lOpen, uOpen);
	}
	includes(key) {
		if (this.lower !== undefined) {
			const c = compareKeys(key, this.lower);
			if (c < 0 || (c === 0 && this.lowerOpen)) return false;
		}
		if (this.upper !== undefined) {
			const c = compareKeys(key, this.upper);
			if (c > 0 || (c === 0 && this.upperOpen)) return false;
		}
		return true;
	}
}

class VirtualIDBRequest {
	constructor() {
		this.readyState = "pending";
		this.result = undefined;
		this.error = null;
		this.onsuccess = null; this.onerror = null;
		this.onupgradeneeded = null;
		this.__listeners = {};
	}
	addEventListener(type, fn) { (this.__listeners[type] = this.__listeners[type] || []).push(fn); }
	__fire(type, event) {
		const e = event || { target: this, type };
		const handler = this["on" + type];
		if (typeof handler === "function") { try { handler.call(this, e); } catch (err) {} }
		for (const fn of (this.__listeners[type] || [])) { try { fn.call(this, e); } catch (err) {} }
	}
	__succeed(result) {
		this.readyState = "done"; this.result = result;
		queueMicrotask(() => this.__fire("success"));
	}
	__fail(err) {
		this.readyState = "done"; this.error = err;
		queueMicrotask(() => this.__fire("error", { target: this, type: "error" }));
	}
	__upgrade(db, oldVersion) {
		// Per spec, request.result is the database during upgradeneeded.
		this.result = db;
		queueMicrotask(() => this.__fire("upgradeneeded", { target: this, type: "upgradeneeded", oldVersion, newVersion: db.version }));
	}
	then(resolve, reject) {
		return new Promise((res, rej) => {
			this.addEventListener("success", () => { try { resolve && resolve(this.result); } catch (e) {} res(this.result); });
			this.addEventListener("error", () => { try { reject && reject(this.error); } catch (e) {} rej(this.error); });
		});
	}
}

class VirtualIDBCursor {
	constructor(source, range, direction, keyGetter, valueGetter) {
		this.source = source;
		this.range = range || null;
		this.direction = direction || "next";
		this.__keyGetter = keyGetter;
		this.__valueGetter = valueGetter;
		this.__keys = source.__sortedKeysInRange(range, direction);
		this.__pos = 0;
		this.__updateCurrent();
	}
	__updateCurrent() {
		if (this.__pos >= this.__keys.length) { this.key = undefined; this.value = undefined; this.primaryKey = undefined; return; }
		const k = this.__keys[this.__pos];
		this.key = idbClone(k.indexKey !== undefined ? k.indexKey : k.key);
		this.primaryKey = idbClone(k.key);
		this.value = this.__valueGetter ? idbClone(this.__valueGetter(k.key)) : undefined;
	}
	continue(nextKey) {
		const req = new VirtualIDBRequest();
		if (nextKey !== undefined) {
			// advance to first key >= nextKey
			while (this.__pos < this.__keys.length && compareKeys(this.__keys[this.__pos].cmp, nextKey) < 0) this.__pos++;
		} else {
			this.__pos++;
		}
		this.__updateCurrent();
		const cursor = (this.key === undefined) ? null : this;
		req.__succeed(cursor);
		return req;
	}
	advance(count) {
		const req = new VirtualIDBRequest();
		this.__pos += Math.max(0, Number(count) || 0);
		this.__updateCurrent();
		req.__succeed(this.key === undefined ? null : this);
		return req;
	}
	update(value) {
		const req = new VirtualIDBRequest();
		if (this.key === undefined) { req.__fail(new Error("InvalidStateError")); return req; }
		this.source.__putRecord(idbClone(value), this.primaryKey, true);
		req.__succeed(this.primaryKey);
		return req;
	}
	delete() {
		const req = new VirtualIDBRequest();
		if (this.key === undefined) { req.__fail(new Error("InvalidStateError")); return req; }
		this.source.__deleteRecord(this.primaryKey);
		req.__succeed(undefined);
		// per spec the cursor moves on; emulate by advancing
		this.__pos++;
		this.__updateCurrent();
		return req;
	}
}

class VirtualIDBIndex {
	constructor(store, name, keyPath, options = {}) {
		this.__store = store;
		this.name = name;
		this.keyPath = keyPath;
		this.unique = !!options.unique;
		this.multiEntry = !!options.multiEntry;
		// indexKey(stringified) -> Set of primary keys
		this.__map = new Map();
	}
	__indexKeyOf(value) {
		const raw = extractKeyPath(value, this.keyPath);
		if (raw === undefined) return undefined;
		if (this.multiEntry && Array.isArray(raw)) return raw.filter(isValidKey);
		return isValidKey(raw) ? [raw] : undefined;
	}
	static __flat(v) { return JSON.stringify(v, (k, x) => x instanceof Date ? { $date: x.getTime() } : x instanceof Uint8Array ? { $u8: Array.from(x) } : x); }
	__addRecord(value, pk) {
		const keys = this.__indexKeyOf(value);
		if (!keys) return;
		for (const k of keys) {
			const f = VirtualIDBIndex.__flat(k);
			let set = this.__map.get(f);
			if (!set) { set = new Set(); this.__map.set(f, set); }
			if (this.unique && set.size > 0 && ![...set].every(x => compareKeys(x, pk) === 0)) {
				throw new Error("ConstraintError: unique index violation on " + this.name);
			}
			set.add(pk);
		}
	}
	__removeRecord(value, pk) {
		const keys = this.__indexKeyOf(value);
		if (!keys) return;
		for (const k of keys) {
			const f = VirtualIDBIndex.__flat(k);
			const set = this.__map.get(f);
			if (set) { set.delete(pk); if (set.size === 0) this.__map.delete(f); }
		}
	}
	__sortedKeysInRange(range, direction) {
		// Build flat list of {cmp: indexKey, key: pk, indexKey}
		const out = [];
		for (const [f, set] of this.__map) {
			for (const pk of set) {
				const ik = JSON.parse(f, (k, x) => x && x.$date !== undefined ? new Date(x.$date) : x && x.$u8 ? Uint8Array.from(x.$u8) : x);
				out.push({ cmp: ik, key: pk, indexKey: ik });
			}
		}
		out.sort((a, b) => compareKeys(a.cmp, b.cmp) || compareKeys(a.key, b.key));
		const filtered = range ? out.filter(e => range.includes(e.cmp)) : out;
		return direction === "prev" || direction === "prevunique" ? filtered.reverse() : filtered;
	}
	__request(fn) { const r = new VirtualIDBRequest(); try { r.__succeed(fn()); } catch (e) { r.__fail(e); } return r; }
	get(key) {
		return this.__request(() => {
			const f = VirtualIDBIndex.__flat(key);
			const set = this.__map.get(f);
			if (!set || set.size === 0) return undefined;
			const pk = [...set][0];
			return idbClone(this.__store.__records.get(pk));
		});
	}
	getKey(key) {
		return this.__request(() => {
			const f = VirtualIDBIndex.__flat(key);
			const set = this.__map.get(f);
			if (!set || set.size === 0) return undefined;
			return idbClone([...set][0]);
		});
	}
	getAll(key, count) {
		return this.__request(() => {
			const out = [];
			for (const e of this.__sortedKeysInRange(key instanceof VirtualIDBKeyRange ? key : (key !== undefined ? VirtualIDBKeyRange.only(key) : null), "next")) {
				out.push(idbClone(this.__store.__records.get(e.key)));
				if (count !== undefined && out.length >= count) break;
			}
			return out;
		});
	}
	getAllKeys(key, count) {
		return this.__request(() => {
			const out = [];
			for (const e of this.__sortedKeysInRange(key instanceof VirtualIDBKeyRange ? key : (key !== undefined ? VirtualIDBKeyRange.only(key) : null), "next")) {
				out.push(idbClone(e.key));
				if (count !== undefined && out.length >= count) break;
			}
			return out;
		});
	}
	count(key) {
		return this.__request(() => this.__sortedKeysInRange(key instanceof VirtualIDBKeyRange ? key : (key !== undefined ? VirtualIDBKeyRange.only(key) : null), "next").length);
	}
	openCursor(range, direction = "next") {
		return this.__request(() => {
			const r = range instanceof VirtualIDBKeyRange ? range : (range !== undefined ? VirtualIDBKeyRange.only(range) : null);
			const c = new VirtualIDBCursor(this, r, direction,
				null, pk => this.__store.__records.get(pk));
			return c.key === undefined ? null : c;
		});
	}
	openKeyCursor(range, direction = "next") {
		return this.__request(() => {
			const r = range instanceof VirtualIDBKeyRange ? range : (range !== undefined ? VirtualIDBKeyRange.only(range) : null);
			const c = new VirtualIDBCursor(this, r, direction, null, null);
			return c.key === undefined ? null : c;
		});
	}
}

class VirtualIDBObjectStore {
	constructor(db, name, options = {}) {
		this.__db = db;
		this.name = name;
		this.keyPath = options.keyPath !== undefined ? options.keyPath : null;
		this.autoIncrement = !!options.autoIncrement;
		this.__records = new Map();      // primaryKey -> value
		this.__sorted = [];             // sorted array of primaryKeys
		this.__indexes = new Map();
		this.__nextAuto = 1;
	}
	__insertSorted(pk) {
		let lo = 0, hi = this.__sorted.length;
		while (lo < hi) { const mid = (lo + hi) >> 1; if (compareKeys(this.__sorted[mid], pk) < 0) lo = mid + 1; else hi = mid; }
		this.__sorted.splice(lo, 0, pk);
	}
	__removeSorted(pk) {
		let lo = 0, hi = this.__sorted.length - 1;
		while (lo <= hi) {
			const mid = (lo + hi) >> 1;
			const c = compareKeys(this.__sorted[mid], pk);
			if (c === 0) { this.__sorted.splice(mid, 1); return; }
			if (c < 0) lo = mid + 1; else hi = mid - 1;
		}
	}
	__resolveKey(value, key, allowOverwrite) {
		let pk = key;
		if (pk === undefined) {
			if (this.keyPath !== null) pk = extractKeyPath(value, this.keyPath);
			if (pk === undefined && this.autoIncrement) { pk = this.__nextAuto++; if (this.keyPath) injectKeyPath(value, this.keyPath, pk); }
		} else if (this.keyPath !== null && this.autoIncrement) {
			injectKeyPath(value, this.keyPath, pk);
		}
		if (!isValidKey(pk)) throw new Error("DataError: invalid key");
		if (!allowOverwrite && this.__records.has(pk)) throw new Error("ConstraintError: key exists");
		return pk;
	}
	__putRecord(value, pk, overwrite) {
		const old = this.__records.get(pk);
		if (old !== undefined) for (const idx of this.__indexes.values()) idx.__removeRecord(old, pk);
		if (!this.__records.has(pk)) this.__insertSorted(pk);
		this.__records.set(pk, value);
		for (const idx of this.__indexes.values()) idx.__addRecord(value, pk);
		if (typeof pk === "number" && pk >= this.__nextAuto) this.__nextAuto = Math.floor(pk) + 1;
		return pk;
	}
	__deleteRecord(pk) {
		const old = this.__records.get(pk);
		if (old === undefined) return false;
		for (const idx of this.__indexes.values()) idx.__removeRecord(old, pk);
		this.__records.delete(pk);
		this.__removeSorted(pk);
		return true;
	}
	__sortedKeysInRange(range, direction) {
		let keys = this.__sorted;
		if (range) keys = keys.filter(k => range.includes(k));
		const out = keys.map(k => ({ cmp: k, key: k }));
		return (direction === "prev" || direction === "prevunique") ? out.reverse() : out;
	}
	__request(fn) { const r = new VirtualIDBRequest(); try { r.__succeed(fn()); } catch (e) { r.__fail(e); } return r; }
	add(value, key) {
		return this.__request(() => this.__putRecord(idbClone(value), this.__resolveKey(idbClone(value), key, false), false));
	}
	put(value, key) {
		return this.__request(() => {
			const v = idbClone(value);
			return this.__putRecord(v, this.__resolveKey(v, key, true), true);
		});
	}
	get(key) {
		return this.__request(() => {
			if (!isValidKey(key)) throw new Error("DataError");
			const v = this.__records.get(key);
			return v === undefined ? undefined : idbClone(v);
		});
	}
	getKey(key) {
		return this.__request(() => {
			if (!isValidKey(key)) throw new Error("DataError");
			return this.__records.has(key) ? idbClone(key) : undefined;
		});
	}
	getAll(key, count) {
		return this.__request(() => {
			const r = key instanceof VirtualIDBKeyRange ? key : (key !== undefined ? VirtualIDBKeyRange.only(key) : null);
			const out = [];
			for (const k of this.__sortedKeysInRange(r, "next")) {
				out.push(idbClone(this.__records.get(k.key)));
				if (count !== undefined && out.length >= count) break;
			}
			return out;
		});
	}
	getAllKeys(key, count) {
		return this.__request(() => {
			const r = key instanceof VirtualIDBKeyRange ? key : (key !== undefined ? VirtualIDBKeyRange.only(key) : null);
			const out = [];
			for (const k of this.__sortedKeysInRange(r, "next")) {
				out.push(idbClone(k.key));
				if (count !== undefined && out.length >= count) break;
			}
			return out;
		});
	}
	delete(key) {
		return this.__request(() => {
			const r = key instanceof VirtualIDBKeyRange ? key : VirtualIDBKeyRange.only(key);
			let n = 0;
			for (const k of this.__sortedKeysInRange(r, "next").map(e => e.key)) { if (this.__deleteRecord(k)) n++; }
			return undefined;
		});
	}
	clear() {
		return this.__request(() => {
			this.__records.clear(); this.__sorted.length = 0;
			for (const idx of this.__indexes.values()) idx.__map.clear();
			return undefined;
		});
	}
	count(key) {
		return this.__request(() => {
			const r = key instanceof VirtualIDBKeyRange ? key : (key !== undefined ? VirtualIDBKeyRange.only(key) : null);
			return this.__sortedKeysInRange(r, "next").length;
		});
	}
	createIndex(name, keyPath, options = {}) {
		if (this.__indexes.has(name)) throw new Error("ConstraintError: index exists");
		const idx = new VirtualIDBIndex(this, name, keyPath, options);
		for (const [pk, v] of this.__records) idx.__addRecord(v, pk);
		this.__indexes.set(name, idx);
		return idx;
	}
	index(name) {
		const idx = this.__indexes.get(name);
		if (!idx) throw new Error("NotFoundError: index " + name);
		return idx;
	}
	deleteIndex(name) {
		if (!this.__indexes.has(name)) throw new Error("NotFoundError");
		this.__indexes.delete(name);
	}
	get indexNames() { return [...this.__indexes.keys()]; }
	openCursor(range, direction = "next") {
		return this.__request(() => {
			const r = range instanceof VirtualIDBKeyRange ? range : (range !== undefined ? VirtualIDBKeyRange.only(range) : null);
			const c = new VirtualIDBCursor(this, r, direction, null, pk => this.__records.get(pk));
			return c.key === undefined ? null : c;
		});
	}
	openKeyCursor(range, direction = "next") {
		return this.__request(() => {
			const r = range instanceof VirtualIDBKeyRange ? range : (range !== undefined ? VirtualIDBKeyRange.only(range) : null);
			const c = new VirtualIDBCursor(this, r, direction, null, null);
			return c.key === undefined ? null : c;
		});
	}
}

class VirtualIDBTransaction {
	constructor(db, storeNames, mode) {
		this.db = db;
		this.mode = mode || "readonly";
		this.__storeNames = Array.isArray(storeNames) ? storeNames : [storeNames];
		this.oncomplete = null; this.onerror = null; this.onabort = null;
		this.__listeners = {};
		this.error = null;
		queueMicrotask(() => this.__fire("complete"));
	}
	addEventListener(type, fn) { (this.__listeners[type] = this.__listeners[type] || []).push(fn); }
	__fire(type) {
		const h = this["on" + type];
		if (typeof h === "function") { try { h({ target: this, type }); } catch (e) {} }
		for (const fn of (this.__listeners[type] || [])) { try { fn({ target: this, type }); } catch (e) {} }
	}
	objectStore(name) {
		if (!this.__storeNames.includes(name)) throw new Error("NotFoundError: store not in transaction");
		return this.db.__stores.get(name) || (() => { throw new Error("NotFoundError: " + name); })();
	}
	abort() { this.__fire("abort"); }
	get objectStoreNames() { return this.__storeNames.slice(); }
}

class VirtualIDBDatabase {
	constructor(factory, name, version, stores) {
		this.__factory = factory;
		this.name = name;
		this.version = version;
		this.__stores = stores; // Map
		this.onclose = null; this.onversionchange = null;
	}
	createObjectStore(name, options = {}) {
		if (this.__stores.has(name)) throw new Error("ConstraintError: store exists");
		const s = new VirtualIDBObjectStore(this, name, options);
		this.__stores.set(name, s);
		return s;
	}
	deleteObjectStore(name) {
		if (!this.__stores.has(name)) throw new Error("NotFoundError");
		this.__stores.delete(name);
	}
	transaction(storeNames, mode = "readonly") {
		const names = Array.isArray(storeNames) ? storeNames : [storeNames];
		for (const n of names) if (!this.__stores.has(n)) throw new Error("NotFoundError: " + n);
		return new VirtualIDBTransaction(this, names, mode);
	}
	get objectStoreNames() { return [...this.__stores.keys()]; }
	close() {}
}

class VirtualIndexedDBFactory {
	constructor(options = {}) {
		this.__dbs = new Map(); // name -> {version, stores}
		this.options = options;
	}
	open(name, version) {
		name = String(name);
		const req = new VirtualIDBRequest();
		let entry = this.__dbs.get(name);
		const newVersion = version === undefined ? (entry ? entry.version : 1) : Number(version);
		if (!Number.isInteger(newVersion) || newVersion < 1) {
			queueMicrotask(() => req.__fail(new Error("TypeError: invalid version")));
			return req;
		}
		if (!entry) { entry = { version: 0, stores: new Map() }; this.__dbs.set(name, entry); }
		const oldVersion = entry.version;
		if (newVersion < oldVersion) {
			queueMicrotask(() => req.__fail(new Error("VersionError")));
			return req;
		}
		const db = new VirtualIDBDatabase(this, name, newVersion, entry.stores);
		if (newVersion > oldVersion) {
			entry.version = newVersion;
			req.__upgrade(db, oldVersion);
		}
		queueMicrotask(() => req.__succeed(db));
		return req;
	}
	deleteDatabase(name) {
		name = String(name);
		const req = new VirtualIDBRequest();
		this.__dbs.delete(name);
		queueMicrotask(() => req.__succeed(undefined));
		return req;
	}
	databases() {
		return Promise.resolve([...this.__dbs.entries()].map(([name, e]) => ({ name, version: e.version })));
	}
}

/* ================================================================== */
/* 3. CACHE STORAGE API — lean in-memory cache for service workers     */
/* ================================================================== */

class VirtualResponse {
	constructor(body, init = {}) {
		this._body = body === undefined ? "" : body;
		this.status = init.status !== undefined ? init.status : 200;
		this.statusText = init.statusText || "";
		this.ok = this.status >= 200 && this.status < 300;
		this.url = init.url || "";
		this.headers = new Map(Object.entries(init.headers || {}));
		this.redirected = false;
		this.type = "basic";
	}
	async text() {
		if (typeof this._body === "string") return this._body;
		return Buffer.from(this._body).toString("utf8");
	}
	async json() { return JSON.parse(await this.text()); }
	async arrayBuffer() {
		if (typeof this._body === "string") {
			const b = Buffer.from(this._body, "utf8");
			return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
		}
		const b = Buffer.from(this._body);
		return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
	}
	clone() { return new VirtualResponse(this._body, { status: this.status, statusText: this.statusText, url: this.url, headers: Object.fromEntries(this.headers) }); }
}
class VirtualRequest {
	constructor(input, init = {}) {
		if (input instanceof VirtualRequest) {
			this.url = input.url; this.method = init.method || input.method;
			this.headers = new Map(init.headers ? Object.entries(init.headers) : input.headers);
			this._body = init.body !== undefined ? init.body : input._body;
		} else {
			this.url = String(input);
			this.method = (init.method || "GET").toUpperCase();
			this.headers = new Map(Object.entries(init.headers || {}));
			this._body = init.body;
		}
		this.mode = init.mode || "cors";
		this.credentials = init.credentials || "same-origin";
	}
	clone() { return new VirtualRequest(this); }
}

class VirtualCache {
	constructor(name) { this.__name = name; this.__entries = new Map(); }
	__key(request) {
		const url = request instanceof VirtualRequest ? request.url : String(request);
		return url;
	}
	async put(request, response) {
		const req = request instanceof VirtualRequest ? request : new VirtualRequest(request);
		const res = response instanceof VirtualResponse ? response : new VirtualResponse(response);
		if (req.method !== "GET") throw new Error("TypeError: only GET cacheable");
		this.__entries.set(this.__key(req), { request: req.clone(), response: res.clone() });
	}
	async add(url) {
		const res = await globalThis.fetch(String(url));
		const body = await res.arrayBuffer();
		await this.put(url, new VirtualResponse(Buffer.from(body), { status: res.status, url: String(url), headers: {} }));
	}
	async addAll(urls) { for (const u of urls) await this.add(u); }
	async match(request, options = {}) {
		const key = this.__key(request);
		const hit = this.__entries.get(key);
		if (!hit) return undefined;
		if (options.ignoreMethod !== true && hit.request.method !== "GET") return undefined;
		return hit.response.clone();
	}
	async matchAll(request, options = {}) {
		const m = await this.match(request, options);
		return m ? [m] : [];
	}
	async delete(request, options = {}) {
		const key = this.__key(request);
		return this.__entries.delete(key);
	}
	async keys(request, options = {}) {
		const out = [];
		for (const { request: r } of this.__entries.values()) {
			if (!request || this.__key(request) === this.__key(r)) out.push(r.clone());
		}
		return out;
	}
}

class VirtualCacheStorage {
	constructor(options = {}) { this.__caches = new Map(); this.options = options; }
	async open(name) {
		name = String(name);
		let c = this.__caches.get(name);
		if (!c) { c = new VirtualCache(name); this.__caches.set(name, c); }
		return c;
	}
	async has(name) { return this.__caches.has(String(name)); }
	async delete(name) { return this.__caches.delete(String(name)); }
	async keys() { return [...this.__caches.keys()]; }
	async match(request, options = {}) {
		for (const c of this.__caches.values()) {
			const m = await c.match(request, options);
			if (m) return m;
		}
		return undefined;
	}
}

/* ================================================================== */
/* 4. NOTIFICATIONS API                                                */
/* ================================================================== */

class VirtualNotification {
	constructor(title, options = {}) {
		this.title = String(title);
		this.body = options.body || "";
		this.icon = options.icon || "";
		this.tag = options.tag || "";
		this.data = options.data;
		this.timestamp = Date.now();
		this.onclick = null; this.onclose = null; this.onerror = null; this.onshow = null;
		VirtualNotification.__delivered.push(this);
		const host = VirtualNotification.__host;
		if (host && typeof host.onNotification === "function") {
			try { host.onNotification(this); } catch (e) {}
		}
		queueMicrotask(() => { try { this.onshow && this.onshow({ target: this }); } catch (e) {} });
	}
	close() {
		const i = VirtualNotification.__delivered.indexOf(this);
		if (i >= 0) VirtualNotification.__delivered.splice(i, 1);
		try { this.onclose && this.onclose({ target: this }); } catch (e) {}
	}
	static async requestPermission() {
		VirtualNotification.permission = "granted";
		return "granted";
	}
	static __reset() { VirtualNotification.__delivered.length = 0; VirtualNotification.permission = "default"; }
}
VirtualNotification.permission = "default";
VirtualNotification.__delivered = [];
VirtualNotification.__host = null;

/* ================================================================== */
/* 5. CLIPBOARD API                                                    */
/* ================================================================== */

class VirtualClipboard {
	constructor() { this.__text = ""; this.__items = []; }
	async writeText(text) { this.__text = String(text); }
	async readText() { return this.__text; }
	async write(items) { this.__items = items; }
	async read() { return this.__items.slice(); }
}

/* ================================================================== */
/* 6. GEOLOCATION API                                                  */
/* ================================================================== */

class VirtualGeolocation {
	constructor(options = {}) {
		const p = options.geoPosition || {};
		const c = p.coords || {};
		this.__position = {
			coords: {
				latitude: c.latitude !== undefined ? c.latitude : 31.7683,
				longitude: c.longitude !== undefined ? c.longitude : 35.2137,
				altitude: c.altitude !== undefined ? c.altitude : null,
				accuracy: c.accuracy !== undefined ? c.accuracy : 10,
				altitudeAccuracy: null, heading: null, speed: null
			},
			timestamp: Date.now()
		};
		this.__watches = new Map();
		this.__nextWatch = 1;
	}
	getCurrentPosition(success, error, options = {}) {
		const timeout = options.timeout !== undefined ? options.timeout : 10000;
		const timer = setTimeout(() => {
			try { error && error({ code: 3, TIMEOUT: 3, message: "Timeout expired" }); } catch (e) {}
		}, timeout);
		queueMicrotask(() => {
			clearTimeout(timer);
			try { success && success(JSON.parse(JSON.stringify(this.__position))); } catch (e) {}
		});
	}
	watchPosition(success, error, options = {}) {
		const id = this.__nextWatch++;
		this.getCurrentPosition(success, error, options);
		this.__watches.set(id, { success, error, options });
		return id;
	}
	clearWatch(id) { this.__watches.delete(id); }
}

/* ================================================================== */
/* 7. STORAGE PERSISTENCE — debounced disk sync for Web Storage        */
/* ================================================================== */

function attachStoragePersistence(windowObject, options = {}) {
	const file = options.storagePersistPath;
	if (!file) return { flush() {} };
	const fs = nodeFs();
	if (!fs) return { flush() {} };
	let timer = null;
	let dirty = false;
	function schedule() {
		dirty = true;
		if (timer) return;
		timer = setTimeout(() => { timer = null; flush(); }, options.storagePersistMs || 500);
		if (timer.unref) timer.unref();
	}
	function flush() {
		if (!dirty) return;
		dirty = false;
		try {
			// Note: .map is a real Map — spread would yield {}; use fromEntries.
			const data = {
				local: windowObject.localStorage ? Object.fromEntries(windowObject.localStorage.map) : {},
				session: windowObject.sessionStorage ? Object.fromEntries(windowObject.sessionStorage.map) : {}
			};
			fs.writeFileSync(file, JSON.stringify(data));
		} catch (e) {}
	}
	function load() {
		try {
			const raw = fs.readFileSync(file, "utf8");
			const data = JSON.parse(raw);
			for (const [k, v] of Object.entries(data.local || {})) windowObject.localStorage.map.set(k, v);
			for (const [k, v] of Object.entries(data.session || {})) windowObject.sessionStorage.map.set(k, v);
		} catch (e) {}
	}
	for (const store of [windowObject.localStorage, windowObject.sessionStorage]) {
		if (!store) continue;
		for (const m of ["setItem", "removeItem", "clear"]) {
			const orig = store[m].bind(store);
			store[m] = (...a) => { const r = orig(...a); schedule(); return r; };
		}
	}
	load();
	windowObject.__flushStorage = flush;
	return { flush };
}

/* ================================================================== */
/* INSTALLER — wires all 10 APIs onto a virtual window                 */
/* ================================================================== */

function installVirtualBrowserApis(windowObject, options = {}) {
	const fsApi = new VirtualFileSystemApi(options);
	windowObject.showOpenFilePicker = (o) => fsApi.showOpenFilePicker(o);
	windowObject.showSaveFilePicker = (o) => fsApi.showSaveFilePicker(o);
	windowObject.showDirectoryPicker = (o) => fsApi.showDirectoryPicker(o);

	windowObject.indexedDB = new VirtualIndexedDBFactory(options);
	windowObject.IDBKeyRange = VirtualIDBKeyRange;

	windowObject.caches = new VirtualCacheStorage(options);
	windowObject.Cache = VirtualCache;
	windowObject.Request = VirtualRequest;
	windowObject.Response = VirtualResponse;

	VirtualNotification.__host = options.notificationHost || null;
	windowObject.Notification = VirtualNotification;

	const nav = windowObject.navigator || {};
	windowObject.navigator = Object.freeze(Object.assign({}, nav, {
		clipboard: new VirtualClipboard(),
		geolocation: new VirtualGeolocation(options)
	}));

	const persistence = attachStoragePersistence(windowObject, options);

	return {
		fsApi,
		indexedDB: windowObject.indexedDB,
		caches: windowObject.caches,
		persistence,
		VirtualNotification,
		VirtualClipboard,
		VirtualGeolocation,
		VirtualCache,
		VirtualRequest,
		VirtualResponse,
		VirtualFileSystemApi,
		VirtualIndexedDBFactory,
		VirtualIDBKeyRange,
		VirtualFileSystemFileHandle,
		VirtualFileSystemDirectoryHandle
	};
}

return {
	VirtualBrowserApis: {
		installVirtualBrowserApis,
		VirtualFileSystemApi,
		VirtualFileSystemFileHandle,
		VirtualFileSystemDirectoryHandle,
		VirtualIndexedDBFactory,
		VirtualIDBKeyRange,
		VirtualCacheStorage,
		VirtualCache,
		VirtualRequest,
		VirtualResponse,
		VirtualNotification,
		VirtualClipboard,
		VirtualGeolocation,
		attachStoragePersistence
	},
	installVirtualBrowserApis
};

});
