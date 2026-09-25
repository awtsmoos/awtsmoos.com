//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveVfsHandle
 * @description
 * Gives the Drive app a VFS handle over its own files, shaped exactly the way
 * WS-6's transfer engine consumes handles:
 *
 *   read(vfsPath, { offsetChars, maxChars }) -> string | { content, totalChars, offsetChars }
 *   list(vfsPath)                            -> [{ path, name, type }]
 *   write(vfsPath, payload)                  -> { ok: true }
 *   mkdir(vfsPath)                           -> { ok: true }
 *
 * All paths are /drive-prefixed (`/drive/docs/a.txt`); the prefix is stripped
 * before hitting the Drive API. Primitives are injected so the handle is fully
 * unit-testable; driveApiVfsPrimitives() wires them to the real client APIs:
 *
 *   read  -> BeriahEntriesResource.content(path)          (verified client API)
 *   list  -> BeriahEntriesResource.listAt(path)           (verified client API)
 *   write -> PUT /api/social/drive/{alias}/stream/{path}  (documented endpoint;
 *            alias derived exactly the way BeriahEntriesResource.publicUrl does)
 *   mkdir -> entriesResource.create({ type: 'folder', path })
 *            (pattern used by ws4's newProject via api.createEntry)
 *
 * Reads honor { offsetChars, maxChars } windows by slicing, and always report
 * totalChars/offsetChars, so WS-6's readWholeFile() seeks correctly on files
 * of any size.
 */

function stripDrivePrefix(vfsPath) {
	return String(vfsPath || '').replace(/^\/+/, '').replace(/^drive\//, '');
}

function normalizeListEntry(entry = {}, folderPath) {
	const name = String(entry.name || entry.path || '').split('/').pop();
	const type = entry.type || entry.kind || (entry.isDirectory ? 'folder' : 'file');
	const folder = String(folderPath || '').replace(/\/+$/, '');
	return {
		name,
		type,
		path: folder ? `${folder}/${name}` : name,
		isDirectory: type === 'folder' || type === 'directory'
	};
}

/**
 * @param {{ readText?:Function, listEntries?:Function, writeText?:Function, makeDirectory?:Function }} primitives
 *   readText(path) -> string|{content}|Promise thereof, drive-relative path
 *   listEntries(path) -> array|{entries}, drive-relative path
 *   writeText(path, text) -> Promise, drive-relative path
 *   makeDirectory(path) -> Promise, drive-relative path
 */
export function createDriveVfsHandle({ readText, listEntries, writeText, makeDirectory } = {}) {
	return {
		async read(vfsPath, { offsetChars = 0, maxChars = null } = {}) {
			if (typeof readText !== 'function') {
				throw new Error('driveVfs.read is not wired: provide readText.');
			}
			const raw = await readText(stripDrivePrefix(vfsPath));
			const text = typeof raw === 'string' ? raw : String(raw?.content ?? '');
			const start = Math.max(0, offsetChars | 0);
			const slice = maxChars == null ? text.slice(start) : text.slice(start, start + maxChars);
			return { ok: true, content: slice, offsetChars: start, totalChars: text.length };
		},

		async list(vfsPath) {
			if (typeof listEntries !== 'function') {
				throw new Error('driveVfs.list is not wired: provide listEntries.');
			}
			const folder = stripDrivePrefix(vfsPath);
			const raw = await listEntries(folder);
			const items = Array.isArray(raw) ? raw : raw?.entries || raw?.items || [];
			return items.map(entry => normalizeListEntry(entry, folder));
		},

		async write(vfsPath, payload) {
			if (typeof writeText !== 'function') {
				throw new Error('driveVfs.write is not wired: provide writeText.');
			}
			const content = typeof payload === 'string' ? payload : String(payload?.content ?? '');
			await writeText(stripDrivePrefix(vfsPath), content);
			return { ok: true };
		},

		async mkdir(vfsPath) {
			if (typeof makeDirectory !== 'function') {
				throw new Error('driveVfs.mkdir is not wired: provide makeDirectory.');
			}
			await makeDirectory(stripDrivePrefix(vfsPath));
			return { ok: true };
		}
	};
}

/**
 * Builds the four primitives from the Drive app's real client APIs.
 *
 * Verified response shapes (geelooy/apps/drive/js/api/):
 *   - entriesResource.content(path) -> readDrivePrivateContent ->
 *     { content: ArrayBuffer, mimeType, byteLength } (8 MB bound enforced).
 *   - entriesResource.listAt(path) -> normalizeEntryResponse ->
 *     { entries: [...] } | { success: { entries: [...] } } | { success: [...] }.
 *   - entriesResource.aliasRoute('') -> '/drive/{alias}' route (same split as
 *     BeriahEntriesResource.publicUrl).
 *   - entriesResource.create({ type: 'folder', path }) -> POST /entries.
 *   - Upload route: PUT /api/social/drive/{alias}/stream/{path} (WS-7 BACKEND_MAP),
 *     authed with the Drive app's canonical authenticationHeaders() transport.
 *
 * @param {object} options
 * @param {object} options.entriesResource  BeriahEntriesResource instance
 * @param {Function} [options.fetchImpl]     defaults to globalThis.fetch
 * @param {string} [options.apiRoot]         defaults to lazy import of ./apiTransport.js
 * @param {Function} [options.encodePath]    defaults to lazy import of ./path.js
 * @param {Function} [options.authHeaders]   defaults to lazy import of ./apiTransport.js
 */
export function driveApiVfsPrimitives({ entriesResource = null, fetchImpl = null, apiRoot = null, encodePath = null, authHeaders = null } = {}) {
	if (!entriesResource) throw new Error('driveApiVfsPrimitives requires { entriesResource }.');
	const doFetch = fetchImpl || (typeof globalThis !== 'undefined' ? globalThis.fetch : null);

	async function readText(path) {
		const result = await entriesResource.content(path);
		if (result == null) return '';
		// readDrivePrivateContent returns { content: ArrayBuffer, ... }.
		const raw = result && typeof result === 'object' && 'content' in result ? result.content : result;
		if (typeof raw === 'string') return raw;
		if (raw instanceof ArrayBuffer) return new TextDecoder().decode(raw);
		if (ArrayBuffer.isView(raw)) return new TextDecoder().decode(raw.buffer);
		return String(raw ?? '');
	}

	async function listEntries(path) {
		const result = await entriesResource.listAt(path);
		const items = Array.isArray(result) ? result
			: result && typeof result === 'object'
				? (Array.isArray(result.entries) ? result.entries
					: Array.isArray(result.success?.entries) ? result.success.entries
					: Array.isArray(result.success) ? result.success
					: Array.isArray(result.items) ? result.items
					: [])
				: [];
		return items.map(entry => ({
			name: String(entry?.name ?? ''),
			type: entry?.type === 'folder' ? 'folder' : 'file',
			path: String(entry?.path ?? ''),
			size: Number(entry?.size ?? 0)
		}));
	}

	function aliasOf() {
		// Same derivation as BeriahEntriesResource.publicUrl (staged, verified).
		return String(entriesResource.aliasRoute('') || '').split('/')[2] || '';
	}

	async function writeText(path, text) {
		if (typeof doFetch !== 'function') throw new Error('driveVfs.write needs fetch.');
		const root = apiRoot || (await import('./apiTransport.js')).API_ROOT;
		const encode = encodePath || (await import('./path.js')).encodeDrivePath;
		const auth = authHeaders || (await import('./apiTransport.js')).authenticationHeaders;
		const alias = aliasOf();
		if (!alias) throw new Error('driveVfs.write: could not determine the drive alias.');
		const url = `${root}/drive/${alias}/stream/${encode(path)}`;
		const headers = typeof auth === 'function' ? auth() : new Headers();
		if (headers && typeof headers.set === 'function') {
			headers.set('Content-Type', 'text/plain;charset=utf-8');
		}
		const response = await doFetch(url, {
			method: 'PUT',
			credentials: 'include',
			headers,
			body: text
		});
		if (!response || response.ok !== true) {
			throw new Error(`driveVfs.write failed for "${path}": HTTP ${response?.status || 'unknown'}.`);
		}
	}

	async function makeDirectory(path) {
		await entriesResource.create({ type: 'folder', path });
	}

	return { readText, listEntries, writeText, makeDirectory };
}
