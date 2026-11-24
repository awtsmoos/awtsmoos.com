//B"H
/**
 * Additive content-addressed asset store for Studio media. It sits BESIDE the
 * existing project library/autosave — nothing migrates and no live save path
 * uses it yet. Assets are immutable, deduplicated by content hash, reference
 * counted, and garbage-collected only when unreferenced. The backend is
 * IndexedDB in the browser; an in-memory backend with identical semantics is
 * used where IndexedDB is unavailable (and in tests).
 */

/** FNV-1a 64-bit content hash (hex) — deduplication key, not a security digest. */
export function hashAssetBytes(bytes) {
	let hash = 0xcbf29ce484222325n;
	for (let i = 0; i < bytes.length; i++) {
		hash ^= BigInt(bytes[i]);
		hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn;
	}
	return `${bytes.length.toString(16)}-${hash.toString(16)}`;
}

/** In-memory backend with the same async contract as the IndexedDB backend. */
export function createMemoryAssetBackend() {
	const map = new Map();
	return {
		kind: 'memory',
		async get(id) { return map.get(id) || null; },
		async set(id, record) { map.set(id, record); },
		async delete(id) { map.delete(id); },
		async keys() { return [...map.keys()]; }
	};
}

/** IndexedDB backend: one object store of {id, bytes, refs, name, createdAt}. */
export function createIndexedDbAssetBackend(dbName = 'awtsmoos-studio-assets') {
	let dbPromise = null;
	const open = () => dbPromise ||= new Promise((resolve, reject) => {
		const request = globalThis.indexedDB.open(dbName, 1);
		request.onupgradeneeded = () => request.result.createObjectStore('assets', { keyPath: 'id' });
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
	const tx = async (mode, run) => {
		const db = await open();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction('assets', mode);
			const request = run(transaction.objectStore('assets'));
			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	};
	return {
		kind: 'indexeddb',
		async get(id) { return tx('readonly', store => store.get(id)); },
		async set(id, record) { await tx('readwrite', store => store.put(record)); },
		async delete(id) { await tx('readwrite', store => store.delete(id)); },
		async keys() { return tx('readonly', store => store.getAllKeys()); }
	};
}

/** Content-addressed store with deduplication and reference counting. */
export class MultitrackAssetStore {
	constructor(backend) {
		this.backend = backend || (globalThis.indexedDB ? createIndexedDbAssetBackend() : createMemoryAssetBackend());
	}
	/** Stores bytes once per content hash; returns the stable asset id. */
	async put(bytes, name = 'asset') {
		const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
		const id = `asset-${hashAssetBytes(data)}`;
		const existing = await this.backend.get(id);
		if (existing) { existing.refs += 1; await this.backend.set(id, existing); return { id, deduplicated: true, refs: existing.refs }; }
		await this.backend.set(id, { id, bytes: data, refs: 1, name: String(name), createdAt: Date.now() });
		return { id, deduplicated: false, refs: 1 };
	}
	async get(id) { const record = await this.backend.get(id); return record ? record.bytes : null; }
	async refs(id) { const record = await this.backend.get(id); return record ? record.refs : 0; }
	/** Drops one reference; deletes the bytes only when the last reference goes. */
	async release(id) {
		const record = await this.backend.get(id);
		if (!record) return false;
		record.refs -= 1;
		if (record.refs <= 0) { await this.backend.delete(id); return true; }
		await this.backend.set(id, record); return false;
	}
	async list() { return this.backend.keys(); }
	/** Total stored bytes across unique assets. */
	async totalBytes() {
		let total = 0;
		for (const id of await this.backend.keys()) total += (await this.backend.get(id))?.bytes?.length || 0;
		return total;
	}
}
