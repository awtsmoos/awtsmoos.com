//B"H
//Boruch Hashem
//Blessed be He

import {
	normalizeWorkspacePath,
	parentWorkspacePath,
	workspaceBasename
} from "../core/path.js";

const DATABASE_NAME = "awtsmoos-drive-browser-v1";
const STORE_NAME = "nodes";

/**
 * Native IndexedDB repository for zero-install Builder workspaces.
 * Files and folders remain browser-local until the creator explicitly chooses a cloud or Tunnel path.
 */
export class BrowserWorkspaceDb {
	constructor(indexedDb = globalThis.indexedDB) {
		this.indexedDb = indexedDb;
		this.databasePromise = null;
	}

	async list(parentPath = ".") {
		const database = await this.database();
		const parent = normalizeWorkspacePath(parentPath);
		const transaction = database.transaction(STORE_NAME, "readonly");
		const index = transaction.objectStore(STORE_NAME).index("parent");
		const rows = await requestValue(index.getAll(parent));
		return rows.sort((left, right) => left.name.localeCompare(right.name));
	}

	async read(path) {
		const node = await this.node(path);
		if (!node || node.type !== "file") throw workspaceError("BROWSER_FILE_NOT_FOUND");
		return String(node.content ?? "");
	}

	async write(path, content) {
		const normalized = normalizeWorkspacePath(path);
		await this.put({
			path: normalized,
			parent: parentWorkspacePath(normalized),
			name: workspaceBasename(normalized),
			type: "file",
			content: String(content ?? ""),
			size: new Blob([String(content ?? "")]).size,
			modifiedAt: Date.now()
		});
		return { ok: true, path: normalized };
	}

	async mkdir(path) {
		const normalized = normalizeWorkspacePath(path);
		if (await this.node(normalized)) throw workspaceError("BROWSER_PATH_EXISTS");
		await this.put({
			path: normalized,
			parent: parentWorkspacePath(normalized),
			name: workspaceBasename(normalized),
			type: "directory",
			size: 0,
			modifiedAt: Date.now()
		});
		return { ok: true, path: normalized };
	}

	async node(path) {
		const database = await this.database();
		const transaction = database.transaction(STORE_NAME, "readonly");
		return await requestValue(transaction.objectStore(STORE_NAME).get(normalizeWorkspacePath(path)));
	}

	async put(node) {
		const database = await this.database();
		const transaction = database.transaction(STORE_NAME, "readwrite");
		const done = transactionDone(transaction);
		await requestValue(transaction.objectStore(STORE_NAME).put(node));
		await done;
	}

	database() {
		if (!this.indexedDb) return Promise.reject(workspaceError("INDEXEDDB_UNAVAILABLE"));
		this.databasePromise ||= openDatabase(this.indexedDb);
		return this.databasePromise;
	}
}

function openDatabase(indexedDb) {
	return new Promise((resolve, reject) => {
		const request = indexedDb.open(DATABASE_NAME, 1);
		request.onupgradeneeded = () => {
			const store = request.result.createObjectStore(STORE_NAME, { keyPath: "path" });
			store.createIndex("parent", "parent", { unique: false });
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error || workspaceError("INDEXEDDB_OPEN_FAILED"));
	});
}

function requestValue(request) {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error || workspaceError("INDEXEDDB_REQUEST_FAILED"));
	});
}

function transactionDone(transaction) {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error || workspaceError("INDEXEDDB_TRANSACTION_FAILED"));
		transaction.onabort = () => reject(transaction.error || workspaceError("INDEXEDDB_TRANSACTION_ABORTED"));
	});
}

function workspaceError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
