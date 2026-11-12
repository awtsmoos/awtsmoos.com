// B"H — IndexedDB store for the Music Player: tracks (with file handles or blobs),
// playlists, and sources. Everything stays in this browser.
const DB_NAME = 'awtsmoos-music';
const DB_VERSION = 1;

let dbPromise = null;

export function openDB() {
	if (dbPromise) return dbPromise;
	dbPromise = new Promise((resolve, reject) => {
		if (!('indexedDB' in window)) { reject(new Error('IndexedDB is not available in this browser.')); return; }
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains('tracks')) {
				const tracks = db.createObjectStore('tracks', { keyPath: 'id' });
				tracks.createIndex('byName', 'name', { unique: false });
				tracks.createIndex('byDateAdded', 'dateAdded', { unique: false });
			}
			if (!db.objectStoreNames.contains('playlists')) db.createObjectStore('playlists', { keyPath: 'id' });
			if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error || new Error('Could not open the music database.'));
	});
	return dbPromise;
}

function req(store, mode, run) {
	return openDB().then((db) => new Promise((resolve, reject) => {
		const t = db.transaction(store, mode);
		const r = run(t.objectStore(store));
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error || new Error('Database request failed.'));
		t.onerror = () => reject(t.error || new Error('Database transaction failed.'));
	}));
}

export const db = {
	putTrack: (track) => req('tracks', 'readwrite', (s) => s.put(track)),
	getAllTracks: () => req('tracks', 'readonly', (s) => s.getAll()),
	deleteTrack: (id) => req('tracks', 'readwrite', (s) => s.delete(id)),
	clearTracks: () => req('tracks', 'readwrite', (s) => s.clear()),
	putPlaylist: (pl) => req('playlists', 'readwrite', (s) => s.put(pl)),
	getAllPlaylists: () => req('playlists', 'readonly', (s) => s.getAll()),
	deletePlaylist: (id) => req('playlists', 'readwrite', (s) => s.delete(id)),
	putMeta: (key, value) => req('meta', 'readwrite', (s) => s.put({ key, value })),
	getMeta: (key) => req('meta', 'readonly', (s) => s.get(key)).then((row) => (row ? row.value : undefined)),
};
