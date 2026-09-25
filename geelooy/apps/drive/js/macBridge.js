// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MacBridge
 * @description First-class virtual <-> Mac file bridge: transfer engine + "Mac ⇄ Virtual" dialog.
 *
 * Yaakov's requirement: moving files between the virtual OS and the Mac must feel INSTANT,
 * like two folders on the same machine. This module is the UX + orchestration layer for
 * that bridge. It lives in the Drive app but imports NOTHING: every capability arrives as
 * an injected handle, so the Geelooy OS shell can host the same module unchanged.
 *
 * VFS-HANDLE CONTRACT (both sides implement this):
 *   {
 *     list: async (vfsPath) -> Array<{ name, type, path?, isDirectory? }>,
 *     read: async (vfsPath, opts?) -> { ok, content } | string,
 *            // opts: { offsetChars, maxChars } — honored by the tunnel adapter
 *            // (see geelooy/os/vfs/tunnelAdapter.js additive read options); adapters
 *            // that ignore opts simply return the whole file.
 *     write: async (vfsPath, content) -> { ok } ,
 *     stat:  async (vfsPath) -> { ok, node? },
 *     mkdir: async (vfsPath) -> { ok }            // optional; Mac side has none
 *   }
 *
 * WIRING (host responsibility — example for the OS shell):
 *   import { tunnelAdapter } from '../../os/vfs/tunnelAdapter.js';
 *   const ta = tunnelAdapter(os);
 *   const macVfsFor = (route) => ({
 *     list:  (p) => ta.list(`/network/${route}${p}`),
 *     read:  (p, opts) => ta.read(`/network/${route}${p}`, opts),
 *     write: (p, c) => ta.write(`/network/${route}${p}`, { content: c }),
 *     stat:  (p) => ta.stat(`/network/${route}${p}`),
 *   });
 *   const driveVfs = {
 *     list:  (p) => osVfs.list(`/drive${p}`),
 *     read:  (p, opts) => osVfs.read(`/drive${p}`, opts),
 *     write: (p, c) => osVfs.write(`/drive${p}`, { content: c }),
 *     stat:  (p) => osVfs.stat(`/drive${p}`),
 *   };
 *   (Standalone Drive app: implement driveVfs over listEntriesAt/getEntryContent/createEntry,
 *   mapping '/drive/a/b' to the drive-relative path 'a/b'.)
 *
 * TRANSFER PROVIDER INTERFACE (the seam the sibling's resumable machinery plugs into):
 *   {
 *     name: 'vfs-copy' | 'resumable-transfer',
 *     resumable: boolean,
 *     copyFile: async (srcPath, destPath, { onProgress({ bytes }), signal }) -> { ok: true, bytes }
 *   }
 * Today the engine ships `createVfsCopyProvider` (works now: read+write through the VFS).
 * `createResumableTransferProvider` is the clearly-marked stub for the sibling's action.
 */

export const MAC_LOCATION = Object.freeze({
	id: 'mac',
	label: 'Mac',
	vfsPrefix: '/network/'
});

/** Read chunk kept under the remoteFs 200k-char tunnel read cap (see remoteFs.read). */
export const READ_CHUNK_CHARS = 192000;

/** Independent file copies in flight at once — bounded so one transfer can't flood the tunnel. */
export const DEFAULT_CONCURRENCY = 4;

export const MAX_NAME_ATTEMPTS = 1000;

/* ------------------------------------------------------------------ */
/* paths                                                               */
/* ------------------------------------------------------------------ */

/** Builds the OS VFS path for one Mac-inner path on the given immutable route. */
export function macPathFor(route, innerPath = '') {
	const clean = String(innerPath || '').replace(/^\/+/, '').replace(/\/+$/, '');
	const encoded = String(route || '');
	return `${MAC_LOCATION.vfsPrefix}${encoded}${clean ? `/${clean}` : ''}`;
}

/** Builds the OS VFS path for one drive-relative path (drive mount is `/drive`). */
export function drivePathFor(entryPath = '') {
	const clean = String(entryPath || '').replace(/^\/+/, '').replace(/^drive\//, '');
	return clean ? `/drive/${clean}` : '/drive';
}

/** Splits 'archive.tar.gz' -> { stem: 'archive.tar', ext: '.gz' }; 'README' -> { stem: 'README', ext: '' }. */
export function splitName(name = '') {
	const text = String(name || '');
	const dot = text.lastIndexOf('.');
	if (dot <= 0) return { stem: text, ext: '' };
	return { stem: text.slice(0, dot), ext: text.slice(dot) };
}

/**
 * Conflict-safe naming: never overwrite on the receiving side.
 * 'photo.jpg' taken -> 'photo (2).jpg'; 'photo (2).jpg' taken -> 'photo (3).jpg'.
 * `existing` is any iterable of names (case-insensitive compare).
 */
export function resolveUniqueName(existing, name = '') {
	const taken = new Set(
		Array.from(existing || []).map(entry => String(entry).toLowerCase())
	);
	const wanted = String(name || 'file');
	if (!taken.has(wanted.toLowerCase())) return wanted;
	const { stem, ext } = splitName(wanted);
	for (let n = 2; n <= MAX_NAME_ATTEMPTS; n += 1) {
		const candidate = `${stem} (${n})${ext}`;
		if (!taken.has(candidate.toLowerCase())) return candidate;
	}
	throw new Error(`Could not find a free name for "${wanted}".`);
}

/* ------------------------------------------------------------------ */
/* routes                                                              */
/* ------------------------------------------------------------------ */

/**
 * Picks the default Mac route from host-supplied route descriptors.
 * Each route: { route, title, subtitle, alive, isVirtual }.
 * Prefers a live native (non-virtual) route — the primary Mac — then any live route.
 */
export function defaultRouteSelector(routes = []) {
	const list = Array.isArray(routes) ? routes : [];
	const live = list.filter(entry => entry && entry.alive !== false);
	return (
		live.find(entry => !entry.isVirtual) ||
		live[0] ||
		list[0] ||
		null
	);
}

/**
 * Normalizes host route descriptors for the picker UI.
 * The host builds these from the OS tunnel device list (remoteDriveIdentity titles).
 */
export function normalizeRoutes(routes = []) {
	return (Array.isArray(routes) ? routes : []).map(entry => ({
		route: String(entry.route || entry.routeReference || ''),
		title: String(entry.title || entry.deviceName || entry.tunnelName || 'Mac'),
		subtitle: String(entry.subtitle || entry.platform || ''),
		alive: entry.alive !== false && entry.connected !== false && entry.isAlive !== false,
		isVirtual: Boolean(entry.isVirtual)
	})).filter(entry => entry.route);
}

/* ------------------------------------------------------------------ */
/* transfer providers                                                  */
/* ------------------------------------------------------------------ */

function throwIfAborted(signal) {
	if (signal?.aborted) {
		const error = new Error('Transfer cancelled.');
		error.code = 'TRANSFER_ABORTED';
		throw error;
	}
}

function readContent(result) {
	if (typeof result === 'string') return result;
	if (result && typeof result.content === 'string') return result.content;
	return '';
}

function readError(result) {
	if (result && result.ok === false) return result.error || 'Read failed.';
	return null;
}

/**
 * Reads one whole file through a VFS read handle, in chunks when the adapter
 * honors { offsetChars, maxChars } (the tunnel adapter does — see its additive
 * read options). Small files complete in a single read. When the file exceeds
 * one chunk AND the adapter ignores offsets, this throws a descriptive error
 * rather than silently returning a truncated file.
 */
export async function readWholeFile(read, vfsPath, { onProgress, signal, chunkChars = READ_CHUNK_CHARS } = {}) {
	const first = await read(vfsPath, { offsetChars: 0, maxChars: chunkChars });
	throwIfAborted(signal);
	const firstError = readError(first);
	if (firstError) throw new Error(firstError);
	const firstContent = readContent(first);
	onProgress?.({ bytes: firstContent.length });
	const total = Number(first?.totalChars);
	if (chunkIsEof(first, firstContent, chunkChars, firstContent.length, total)) return firstContent;

	// The file needs more chunks: verify the adapter actually honors offsets.
	const offset = firstContent.length;
	const probe = await read(vfsPath, { offsetChars: offset, maxChars: chunkChars });
	throwIfAborted(signal);
	const probeError = readError(probe);
	if (probeError) throw new Error(probeError);
	const probeOffset = Number(probe?.offsetChars);
	const seekable = Number.isFinite(probeOffset) && probeOffset === offset;
	if (!seekable) {
		if (Number.isFinite(total) && total > firstContent.length) {
			const error = new Error(
				`Cannot stream "${vfsPath}": the file is ${total} chars but this location returned ` +
				`only ${firstContent.length} and does not support offset reads. ` +
				'Use the resumable transfer provider.'
			);
			error.code = 'READ_RANGE_UNSUPPORTED';
			throw error;
		}
		// No paging metadata and no way to fetch more: return what the adapter
		// gave us. Documented limitation — paging adapters must report totalChars
		// or echo offsetChars (the tunnel adapter does both).
		return firstContent;
	}

	const parts = [firstContent];
	const probeContent = readContent(probe);
	parts.push(probeContent);
	let done = offset + probeContent.length;
	onProgress?.({ bytes: probeContent.length });
	if (chunkIsEof(probe, probeContent, chunkChars, done, Number(probe?.totalChars))) {
		return parts.join('');
	}
	for (;;) {
		throwIfAborted(signal);
		const chunk = await read(vfsPath, { offsetChars: done, maxChars: chunkChars });
		const chunkError = readError(chunk);
		if (chunkError) throw new Error(chunkError);
		const content = readContent(chunk);
		if (!content) break;
		parts.push(content);
		done += content.length;
		onProgress?.({ bytes: content.length });
		if (chunkIsEof(chunk, content, chunkChars, done, Number(chunk?.totalChars))) break;
	}
	return parts.join('');
}

function chunkIsEof(response, content, chunkChars, cumulative, total = Number(response?.totalChars)) {
	if (!content) return true;
	if (content.length < chunkChars) return true;
	if (Number.isFinite(total) && cumulative >= total) return true;
	// No paging metadata at all: treat a full chunk as the whole file rather
	// than guessing at offsets the adapter may not honor.
	if (response?.nextOffsetChars == null && !Number.isFinite(total)) return true;
	return false;
}

/**
 * vfsCopyProvider — works TODAY. Copies via plain VFS read + write:
 * chunked reads stream through the existing remoteFs read (chunk size documented
 * in READ_CHUNK_CHARS); the write is one shot per file.
 *
 * @param {{ read, write, chunkChars? }} handles — bound read/write functions.
 */
export function createVfsCopyProvider({ read, write, chunkChars = READ_CHUNK_CHARS } = {}) {
	if (typeof read !== 'function' || typeof write !== 'function') {
		throw new Error('createVfsCopyProvider requires { read, write } functions.');
	}
	return {
		name: 'vfs-copy',
		resumable: false,
		async copyFile(srcPath, destPath, { onProgress, signal } = {}) {
			throwIfAborted(signal);
			const content = await readWholeFile(read, srcPath, { onProgress, signal, chunkChars });
			throwIfAborted(signal);
			const result = await write(destPath, content);
			if (result && result.ok === false) {
				throw new Error(result.error || 'Write failed.');
			}
			return { ok: true, bytes: content.length };
		}
	};
}

/**
 * resumableTransferProvider — STUB for the sibling's tunnel-agent machinery.
 *
 * ---- SIBLING INTEGRATION POINT -------------------------------------------
 * When the sibling's resumable chunked transfer action lands, wire it here:
 *
 *   const provider = createResumableTransferProvider({
 *     begin:  (payload) => Client.fsAction(route, { action: 'transferBegin', ...payload }),
 *     chunk:  (payload) => Client.fsAction(route, { action: 'transferChunk', ...payload }),
 *     commit: (payload) => Client.fsAction(route, { action: 'transferCommit', ...payload }),
 *     abort:  (payload) => Client.fsAction(route, { action: 'transferAbort', ...payload }),
 *   });
 *
 * Proposed sibling contract (kept stable by this stub's tests):
 *   begin({ src, dest, bytes })            -> { ok, transferId, chunkChars }
 *   chunk({ transferId, offset, data })    -> { ok, received }
 *   commit({ transferId })                 -> { ok, bytes }
 *   abort({ transferId })                  -> { ok: true }
 *
 * Feature detection: with no actions supplied, `provider.available === false`
 * and copyFile() rejects with code RESUMABLE_TRANSFER_UNAVAILABLE, so the
 * engine can fall back to vfsCopyProvider automatically.
 * ---------------------------------------------------------------------------
 */
export function createResumableTransferProvider(actions = {}) {
	const { begin, chunk, commit, abort } = actions;
	const available = [begin, chunk, commit, abort].every(fn => typeof fn === 'function');
	return {
		name: 'resumable-transfer',
		resumable: true,
		available,
		async copyFile(srcPath, destPath, { onProgress, signal } = {}) {
			if (!available) {
				const error = new Error(
					'Resumable transfer is not available yet: the tunnel agent action has not landed. ' +
					'Falling back to vfsCopyProvider.'
				);
				error.code = 'RESUMABLE_TRANSFER_UNAVAILABLE';
				throw error;
			}
			throwIfAborted(signal);
			const opened = await begin({ src: srcPath, dest: destPath });
			if (!opened || opened.ok === false || !opened.transferId) {
				throw new Error(opened?.error || 'transferBegin failed.');
			}
			const transferId = opened.transferId;
			const chunkChars = Number(opened.chunkChars) > 0 ? Math.floor(opened.chunkChars) : READ_CHUNK_CHARS;
			// NOTE: real chunk streaming of the SOURCE bytes happens here once the
			// sibling's action exists; the stub drives the begin/chunk/commit/abort
			// handshake so the integration shape is locked by tests.
			try {
				let offset = 0;
				for (;;) {
					throwIfAborted(signal);
					// The sibling's begin() may return a first data window; when it does
					// not, chunk() with an empty window is a no-op probe.
					const sent = await chunk({ transferId, offset, data: '' });
					if (!sent || sent.ok === false) {
						throw new Error(sent?.error || 'transferChunk failed.');
					}
					const received = Number(sent.received ?? 0);
					if (received <= 0) break;
					offset += received;
					onProgress?.({ bytes: received });
					if (received < chunkChars) break;
				}
				const done = await commit({ transferId });
				if (!done || done.ok === false) throw new Error(done?.error || 'transferCommit failed.');
				return { ok: true, bytes: Number(done.bytes ?? offset) };
			} catch (error) {
				await abort({ transferId }).catch(() => null);
				throw error;
			}
		}
	};
}

/**
 * Picks the best available provider: resumable when the sibling's action is
 * wired, otherwise the vfs copy provider that works today.
 */
export function selectProvider({ resumableActions, read, write, chunkChars } = {}) {
	const resumable = createResumableTransferProvider(resumableActions || {});
	if (resumable.available) return resumable;
	return createVfsCopyProvider({ read, write, chunkChars });
}

/* ------------------------------------------------------------------ */
/* transfer engine                                                     */
/* ------------------------------------------------------------------ */

/**
 * Creates the bounded-concurrency transfer engine.
 *
 * plan: Array<{ src, dest, name }> — conflict-free destinations, resolved by the
 *       caller (sendToMac / fetchFromMac) BEFORE the engine starts, so the UI
 *       can render the final names instantly (optimistic UI).
 *
 * Events: onProgress({ done, total, current, bytes }), onFile(item).
 * item: { src, dest, name, status, bytes, error }
 *   status: 'queued' | 'active' | 'done' | 'error' | 'aborted'
 */
export function createTransferEngine({
	provider,
	plan = [],
	concurrency = DEFAULT_CONCURRENCY,
	onProgress = () => {},
	onFile = () => {},
	signal
} = {}) {
	if (!provider || typeof provider.copyFile !== 'function') {
		throw new Error('createTransferEngine requires a provider with copyFile().');
	}
	const workerCount = Math.max(1, Math.floor(concurrency) || 1);
	const state = {
		items: plan.map(entry => ({
			src: entry.src,
			dest: entry.dest,
			name: entry.name || String(entry.dest).split('/').pop(),
			status: 'queued',
			bytes: 0,
			error: ''
		})),
		started: false,
		finished: false,
		current: '',
		bytes: 0
	};

	const snapshot = () => ({
		done: state.items.filter(item => item.status === 'done').length,
		failed: state.items.filter(item => item.status === 'error').length,
		total: state.items.length,
		current: state.current,
		bytes: state.bytes,
		finished: state.finished
	});

	function emitFile(item) {
		try { onFile({ ...item }); } catch (_ignored) { /* listener errors never break a transfer */ }
	}

	async function runOne(item) {
		item.status = 'active';
		state.current = item.name;
		emitFile(item);
		let lastBytes = 0;
		try {
			const result = await provider.copyFile(item.src, item.dest, {
				signal,
				onProgress: ({ bytes = 0 } = {}) => {
					const delta = Math.max(0, bytes - lastBytes);
					lastBytes = bytes;
					item.bytes = bytes;
					state.bytes += delta;
					try { onProgress(snapshot()); } catch (_ignored) {}
				}
			});
			item.bytes = result?.bytes ?? item.bytes;
			item.status = 'done';
		} catch (error) {
			item.status = signal?.aborted ? 'aborted' : 'error';
			item.error = error?.message || String(error);
			item.code = error?.code || '';
		}
		emitFile(item);
	}

	async function start() {
		if (state.started) return snapshot();
		state.started = true;
		const queue = [...state.items];
		let active = 0;
		let index = 0;
		let resolveDone;
		const finished = new Promise(resolve => { resolveDone = resolve; });

		const pump = () => {
			if (signal?.aborted) {
				for (const item of queue.slice(index)) {
					if (item.status === 'queued') { item.status = 'aborted'; emitFile(item); }
				}
				index = queue.length;
			}
			while (active < workerCount && index < queue.length) {
				const item = queue[index++];
				if (item.status !== 'queued') continue;
				active += 1;
				runOne(item).finally(() => {
					active -= 1;
					try { onProgress(snapshot()); } catch (_ignored) {}
					if (index >= queue.length && active === 0) {
						state.finished = true;
						resolveDone(snapshot());
					} else {
						pump();
					}
				});
			}
			if (index >= queue.length && active === 0 && !state.finished) {
				state.finished = true;
				resolveDone(snapshot());
			}
		};
		pump();
		return finished;
	}

	function retryFailed() {
		const failed = state.items.filter(item => item.status === 'error');
		for (const item of failed) {
			item.status = 'queued';
			item.error = '';
			item.code = '';
		}
		state.finished = false;
		state.started = false;
		return failed.length;
	}

	return {
		state,
		snapshot,
		start,
		retryFailed,
		get items() { return state.items; }
	};
}

function isFolderEntry(entry = {}) {
	return entry.isDirectory === true ||
		entry.type === 'folder' ||
		entry.type === 'directory';
}

function entryName(entry = {}) {
	return String(entry.name || entry.path || 'file').split('/').pop();
}

function entryInnerPath(entry = {}) {
	return String(entry.path || entry.name || '').replace(/^\/+/, '');
}

/** Lists one folder's immediate child names through a VFS handle (best effort). */
export async function listChildNames(vfs, vfsPath) {
	try {
		const entries = await vfs.list(vfsPath);
		const list = Array.isArray(entries) ? entries : [];
		return list.map(entry => String(entry.name || '').split('/').pop()).filter(Boolean);
	} catch (_error) {
		return [];
	}
}

/**
 * Resolves conflict-free destinations for a batch: lists the destination folder
 * ONCE, then assigns `name (2).ext` style names without overwriting.
 */
export async function planDestinations(vfs, destDirVfsPath, entries) {
	const taken = new Set(await listChildNames(vfs, destDirVfsPath));
	return entries.map(entry => {
		const name = resolveUniqueName(taken, entryName(entry));
		taken.add(name);
		return { entry, name };
	});
}

function joinInner(folder, name) {
	const clean = String(folder || '').replace(/^\/+/, '').replace(/\/+$/, '');
	return clean ? `${clean}/${name}` : name;
}

/* ------------------------------------------------------------------ */
/* high-level directions                                               */
/* ------------------------------------------------------------------ */

/**
 * Sends Drive entries to a Mac folder. `entries`: [{ path, name }] with
 * drive-relative (or /drive-prefixed) paths. `macFolder`: Mac-inner folder path.
 */
export async function sendToMac(entries, macFolder = '', options = {}) {
	const { driveVfs, macVfs, route, provider, concurrency, onProgress, onFile, signal } = options;
	if (!driveVfs || !macVfs) throw new Error('sendToMac requires { driveVfs, macVfs }.');
	if (!route) throw new Error('sendToMac requires a Mac route.');
	const files = (entries || []).filter(entry => !isFolderEntry(entry));
	const destDir = macPathFor(route, macFolder);
	const planned = await planDestinations(macVfs, destDir, files);
	const activeProvider = provider ||
		selectProvider({ read: driveVfs.read, write: macVfs.write });
	const engine = createTransferEngine({
		provider: activeProvider,
		plan: planned.map(({ entry, name }) => ({
			src: drivePathFor(entryInnerPath(entry)),
			dest: macPathFor(route, joinInner(macFolder, name)),
			name
		})),
		concurrency,
		onProgress,
		onFile,
		signal
	});
	return engine.start().then(final => ({ ...final, engine, providerName: activeProvider.name }));
}

/**
 * Fetches Mac entries into a Drive folder. `macEntries`: [{ path, name }] with
 * Mac-inner paths. `driveFolder`: drive-relative folder path.
 */
export async function fetchFromMac(macEntries, driveFolder = '', options = {}) {
	const { driveVfs, macVfs, route, provider, concurrency, onProgress, onFile, signal } = options;
	if (!driveVfs || !macVfs) throw new Error('fetchFromMac requires { driveVfs, macVfs }.');
	if (!route) throw new Error('fetchFromMac requires a Mac route.');
	const files = (macEntries || []).filter(entry => !isFolderEntry(entry));
	const destDir = drivePathFor(driveFolder);
	const planned = await planDestinations(driveVfs, destDir, files);
	const activeProvider = provider ||
		selectProvider({ read: macVfs.read, write: driveVfs.write });
	const engine = createTransferEngine({
		provider: activeProvider,
		plan: planned.map(({ entry, name }) => ({
			src: macPathFor(route, entryInnerPath(entry)),
			dest: drivePathFor(joinInner(driveFolder, name)),
			name
		})),
		concurrency,
		onProgress,
		onFile,
		signal
	});
	return engine.start().then(final => ({ ...final, engine, providerName: activeProvider.name }));
}

/* ------------------------------------------------------------------ */
/* destination folder picker (minimal; mirrors DriveFolderChooser)     */
/* ------------------------------------------------------------------ */

/**
 * Minimal folder picker over an injected VFS handle.
 *
 * Why not import DriveFolderChooser? It is bound to the Drive HTTP API
 * (listEntriesAt/createFolder over drive-relative paths). The Mac side must
 * browse `/network/<route>/…` through the VFS instead, so this picker takes a
 * `{ list, mkdir? }` handle and exposes the same open/enter/up/snapshot shape.
 * The host may still use DriveFolderChooser for the Drive side; this picker
 * covers the Mac side (and doubles as the drive-side picker when the host
 * prefers one code path for both).
 */
export class FolderPicker {
	constructor({ vfs, root = '/', onChange = () => {} } = {}) {
		if (!vfs || typeof vfs.list !== 'function') {
			throw new Error('FolderPicker requires a vfs with list().');
		}
		this.vfs = vfs;
		this.root = String(root || '/');
		this.path = this.root;
		this.folders = [];
		this.loading = false;
		this.error = '';
		this.onChange = onChange;
	}

	async open(path = this.root) {
		this.path = this.bound(String(path || this.root));
		return this.refresh();
	}

	async enter(path) {
		this.path = this.bound(path);
		return this.refresh();
	}

	async up() {
		if (this.path === this.root) return this.snapshot();
		const parent = this.path.replace(/\/[^/]+\/?$/, '') || this.root;
		return this.enter(parent);
	}

	canCreate() {
		return typeof this.vfs.mkdir === 'function';
	}

	async createAndEnter(name) {
		const folderName = String(name || '').trim();
		if (!folderName) throw new Error('Enter a folder name first.');
		if (!this.canCreate()) throw new Error('This location does not support creating folders.');
		await this.vfs.mkdir(this.join(this.path, folderName));
		return this.enter(this.join(this.path, folderName));
	}

	async refresh() {
		this.loading = true;
		this.error = '';
		this.notify();
		try {
			const entries = await this.vfs.list(this.path);
			const list = Array.isArray(entries) ? entries : [];
			this.folders = list
				.filter(isFolderEntry)
				.map(entry => ({
					name: String(entry.name || '').split('/').pop(),
					path: this.join(this.path, String(entry.name || '').split('/').pop())
				}))
				.filter(folder => folder.name)
				.sort((left, right) => left.name.localeCompare(right.name));
		} catch (error) {
			this.folders = [];
			this.error = error?.message || String(error);
			throw error;
		} finally {
			this.loading = false;
			this.notify();
		}
		return this.snapshot();
	}

	snapshot() {
		return {
			path: this.path,
			folders: this.folders.map(folder => ({ ...folder })),
			loading: this.loading,
			error: this.error,
			canCreate: this.canCreate()
		};
	}

	notify() {
		try { this.onChange(this.snapshot()); } catch (_ignored) {}
		return this.snapshot();
	}

	bound(path) {
		const clean = `/${String(path).replace(/^\/+/, '')}`.replace(/\/+$/, '') || '/';
		if (clean === this.root || clean.startsWith(`${this.root}/`) || this.root === '/') return clean;
		return this.root;
	}

	join(parent, child) {
		const base = String(parent).replace(/\/+$/, '');
		return `${base}/${String(child).replace(/^\/+/, '')}`;
	}
}

/* ------------------------------------------------------------------ */
/* "Mac ⇄ Virtual" transfer dialog                                     */
/* ------------------------------------------------------------------ */

const DIALOG_STYLE_ID = 'mac-bridge-dialog-style';

function ensureDialogStyle(documentObject) {
	if (documentObject.getElementById(DIALOG_STYLE_ID)) return;
	const style = documentObject.createElement('style');
	style.id = DIALOG_STYLE_ID;
	style.textContent = `
.mac-bridge-overlay{position:fixed;inset:0;background:rgba(10,12,20,.55);display:flex;align-items:center;justify-content:center;z-index:9999;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.mac-bridge-card{background:#fff;border-radius:14px;width:min(620px,94vw);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(0,0,0,.35);overflow:hidden}
.mac-bridge-head{padding:14px 18px;border-bottom:1px solid #ececf1;display:flex;align-items:center;gap:10px}
.mac-bridge-title{font-size:16px;font-weight:650;flex:1}
.mac-bridge-close{border:0;background:#f1f1f5;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:15px}
.mac-bridge-body{padding:14px 18px;overflow:auto;display:flex;flex-direction:column;gap:12px}
.mac-bridge-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.mac-bridge-label{font-size:12px;color:#666;min-width:86px}
.mac-bridge-select,.mac-bridge-input{flex:1;border:1px solid #dcdce3;border-radius:8px;padding:7px 10px;font-size:13px;min-width:0}
.mac-bridge-picker{border:1px solid #e4e4ea;border-radius:10px;padding:8px 10px;background:#fafafc}
.mac-bridge-crumb{font-size:12px;color:#555;margin-bottom:6px;word-break:break-all}
.mac-bridge-folders{display:flex;flex-wrap:wrap;gap:6px;max-height:120px;overflow:auto}
.mac-bridge-folder{border:1px solid #dcdce3;background:#fff;border-radius:8px;padding:5px 10px;font-size:12px;cursor:pointer}
.mac-bridge-folder:hover{background:#eef2ff;border-color:#b9c6ff}
.mac-bridge-files{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto}
.mac-bridge-file{display:flex;align-items:center;gap:8px;border:1px solid #eee;border-radius:8px;padding:6px 10px;font-size:13px}
.mac-bridge-filename{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mac-bridge-badge{font-size:11px;font-weight:600;border-radius:20px;padding:2px 9px;white-space:nowrap}
.mac-bridge-badge.queued{background:#f1f1f5;color:#555}
.mac-bridge-badge.syncing{background:#e8f0ff;color:#2456c6}
.mac-bridge-badge.done{background:#e6f7ec;color:#157a3a}
.mac-bridge-badge.error{background:#fdecec;color:#b3261e}
.mac-bridge-badge.aborted{background:#f1f1f5;color:#888}
.mac-bridge-filebar{height:4px;background:#eee;border-radius:2px;overflow:hidden;min-width:60px;flex:0 0 60px}
.mac-bridge-filebar>i{display:block;height:100%;width:0;background:#3b6cff;transition:width .15s}
.mac-bridge-progress{height:8px;background:#eee;border-radius:4px;overflow:hidden}
.mac-bridge-progress>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#3b6cff,#7a5cff);transition:width .15s}
.mac-bridge-status{font-size:12px;color:#555}
.mac-bridge-error{font-size:12px;color:#b3261e}
.mac-bridge-foot{padding:12px 18px;border-top:1px solid #ececf1;display:flex;gap:8px;justify-content:flex-end}
.mac-bridge-btn{border:0;border-radius:9px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer}
.mac-bridge-btn.primary{background:#2456c6;color:#fff}
.mac-bridge-btn.ghost{background:#f1f1f5;color:#333}
.mac-bridge-btn:disabled{opacity:.5;cursor:default}
`;
	documentObject.head.appendChild(style);
}

function el(documentObject, tag, className, text) {
	const node = documentObject.createElement(tag);
	if (className) node.className = className;
	if (text != null) node.textContent = text;
	return node;
}

const DIRECTION_COPY = {
	'to-mac': { title: 'Send to Mac', verb: 'Sending', destLabel: 'Mac folder' },
	'from-mac': { title: 'Fetch from Mac', verb: 'Fetching', destLabel: 'Drive folder' }
};

/**
 * Mounts the "Mac ⇄ Virtual" transfer dialog.
 *
 * container: DOM element to mount into.
 * options: {
 *   entries,            // [{ path, name, type? }] source entries (files only are sent)
 *   direction,          // 'to-mac' | 'from-mac'
 *   routes,             // normalized route descriptors (see normalizeRoutes)
 *   route,              // pre-selected route (optional)
 *   macVfsFor,          // (route) -> vfs handle bound to /network/<route>
 *   driveVfs,           // vfs handle bound to /drive
 *   startFolder,        // initial destination inner path (default: root)
 *   concurrency,        // default DEFAULT_CONCURRENCY
 *   startOnOpen,        // default true — progress shows immediately (instant feel)
 *   onDone(result)      // optional completion callback
 * }
 *
 * Returns { enginePromise, close }.
 */
export function mountBridgeDialog(container, options = {}) {
	const documentObject = container?.ownerDocument;
	if (!documentObject || typeof documentObject.createElement !== 'function') {
		throw new Error('mountBridgeDialog requires a browser DOM container.');
	}
	const {
		entries = [],
		direction = 'to-mac',
		routes = [],
		route: initialRoute,
		macVfsFor,
		driveVfs,
		startFolder = '',
		concurrency = DEFAULT_CONCURRENCY,
		startOnOpen = true,
		onDone = () => {}
	} = options;
	const copy = DIRECTION_COPY[direction] || DIRECTION_COPY['to-mac'];
	if (typeof macVfsFor !== 'function') throw new Error('mountBridgeDialog requires macVfsFor(route).');
	if (!driveVfs) throw new Error('mountBridgeDialog requires driveVfs.');

	ensureDialogStyle(documentObject);

	const files = (entries || []).filter(entry => !isFolderEntry(entry));
	const routeList = normalizeRoutes(routes);
	let activeRoute = initialRoute || defaultRouteSelector(routeList)?.route || '';
	let destInner = String(startFolder || '').replace(/^\/+/, '');
	let engine = null;
	let aborted = false;
	const controller = new AbortController();

	/* ---- skeleton ---- */
	const overlay = el(documentObject, 'div', 'mac-bridge-overlay');
	const card = el(documentObject, 'div', 'mac-bridge-card');
	overlay.appendChild(card);

	const head = el(documentObject, 'div', 'mac-bridge-head');
	head.appendChild(el(documentObject, 'div', 'mac-bridge-title', `${copy.title} — Mac ⇄ Virtual`));
	const closeBtn = el(documentObject, 'button', 'mac-bridge-close', '✕');
	closeBtn.setAttribute('aria-label', 'Close');
	head.appendChild(closeBtn);
	card.appendChild(head);

	const body = el(documentObject, 'div', 'mac-bridge-body');
	card.appendChild(body);

	// route row
	const routeRow = el(documentObject, 'div', 'mac-bridge-row');
	routeRow.appendChild(el(documentObject, 'span', 'mac-bridge-label', 'Mac'));
	const routeSelect = el(documentObject, 'select', 'mac-bridge-select');
	for (const entry of routeList) {
		const option = el(documentObject, 'option', '', `${entry.title}${entry.subtitle ? ` — ${entry.subtitle}` : ''}${entry.alive ? '' : ' (offline)'}`);
		option.value = entry.route;
		if (entry.route === activeRoute) option.selected = true;
		routeSelect.appendChild(option);
	}
	routeRow.appendChild(routeSelect);
	body.appendChild(routeRow);

	// destination picker
	const destRow = el(documentObject, 'div', 'mac-bridge-row');
	destRow.appendChild(el(documentObject, 'span', 'mac-bridge-label', copy.destLabel));
	const pickerBox = el(documentObject, 'div', 'mac-bridge-picker');
	pickerBox.style.flex = '1';
	const crumb = el(documentObject, 'div', 'mac-bridge-crumb', '/');
	const folderWrap = el(documentObject, 'div', 'mac-bridge-folders');
	const pickerNav = el(documentObject, 'div', 'mac-bridge-row');
	const upBtn = el(documentObject, 'button', 'mac-bridge-folder', '↑ Up');
	const newFolderInput = el(documentObject, 'input', 'mac-bridge-input');
	newFolderInput.placeholder = 'New folder name…';
	newFolderInput.style.maxWidth = '160px';
	const newFolderBtn = el(documentObject, 'button', 'mac-bridge-folder', '+ New folder');
	pickerNav.appendChild(upBtn);
	pickerNav.appendChild(newFolderInput);
	pickerNav.appendChild(newFolderBtn);
	pickerBox.appendChild(crumb);
	pickerBox.appendChild(folderWrap);
	pickerBox.appendChild(pickerNav);
	destRow.appendChild(pickerBox);
	body.appendChild(destRow);

	// file list (optimistic: rows appear instantly with a "syncing" badge)
	const fileList = el(documentObject, 'div', 'mac-bridge-files');
	body.appendChild(fileList);
	const rowByName = new Map();
	for (const entry of files) {
		const row = el(documentObject, 'div', 'mac-bridge-file');
		row.appendChild(el(documentObject, 'span', 'mac-bridge-filename', entryName(entry)));
		const bar = el(documentObject, 'div', 'mac-bridge-filebar');
		const fill = el(documentObject, 'i');
		bar.appendChild(fill);
		row.appendChild(bar);
		const badge = el(documentObject, 'span', 'mac-bridge-badge queued', 'queued');
		row.appendChild(badge);
		fileList.appendChild(row);
		rowByName.set(entryName(entry), { row, badge, fill, error: null });
	}

	// overall progress
	const progressBar = el(documentObject, 'div', 'mac-bridge-progress');
	const progressFill = el(documentObject, 'i');
	progressBar.appendChild(progressFill);
	body.appendChild(progressBar);
	const statusLine = el(documentObject, 'div', 'mac-bridge-status', 'Ready.');
	const errorLine = el(documentObject, 'div', 'mac-bridge-error', '');
	body.appendChild(statusLine);
	body.appendChild(errorLine);

	// footer
	const foot = el(documentObject, 'div', 'mac-bridge-foot');
	const retryBtn = el(documentObject, 'button', 'mac-bridge-btn ghost', 'Retry failed');
	retryBtn.disabled = true;
	const cancelBtn = el(documentObject, 'button', 'mac-bridge-btn ghost', 'Cancel');
	const startBtn = el(documentObject, 'button', 'mac-bridge-btn primary', startOnOpen ? 'Transferring…' : 'Start transfer');
	startBtn.disabled = startOnOpen;
	foot.appendChild(retryBtn);
	foot.appendChild(cancelBtn);
	foot.appendChild(startBtn);
	card.appendChild(foot);

	container.appendChild(overlay);

	/* ---- picker wiring ---- */
	let picker = null;
	function pickerVfs() {
		return direction === 'to-mac' ? macVfsFor(activeRoute) : driveVfs;
	}
	function renderPicker(snapshot) {
		crumb.textContent = (direction === 'to-mac' ? `Mac:${activeRoute.slice(0, 12)}…` : 'Drive') + (snapshot.path === '/' ? '/' : snapshot.path);
		destInner = snapshot.path === '/' ? '' : snapshot.path.replace(/^\/+/, '');
		folderWrap.textContent = '';
		if (snapshot.loading) folderWrap.appendChild(el(documentObject, 'span', 'mac-bridge-status', 'Loading…'));
		if (snapshot.error) folderWrap.appendChild(el(documentObject, 'span', 'mac-bridge-error', snapshot.error));
		for (const folder of snapshot.folders) {
			const btn = el(documentObject, 'button', 'mac-bridge-folder', `📁 ${folder.name}`);
			btn.addEventListener('click', () => picker.enter(folder.path));
			folderWrap.appendChild(btn);
		}
		newFolderBtn.style.display = snapshot.canCreate ? '' : 'none';
		newFolderInput.style.display = snapshot.canCreate ? '' : 'none';
	}
	async function resetPicker() {
		picker = new FolderPicker({
			vfs: pickerVfs(),
			root: '/',
			onChange: renderPicker
		});
		try { await picker.open('/'); } catch (_error) { /* rendered via snapshot error */ }
	}
	upBtn.addEventListener('click', () => picker?.up());
	newFolderBtn.addEventListener('click', async () => {
		try { await picker?.createAndEnter(newFolderInput.value); newFolderInput.value = ''; }
		catch (error) { errorLine.textContent = error?.message || String(error); }
	});
	routeSelect.addEventListener('change', () => {
		activeRoute = routeSelect.value;
		if (!engine) resetPicker();
	});

	/* ---- transfer wiring ---- */
	function setRow(name, status, note) {
		const row = rowByName.get(name);
		if (!row) return;
		row.badge.className = `mac-bridge-badge ${status}`;
		row.badge.textContent = status === 'active' ? 'syncing' : status;
		if (status === 'done') row.fill.style.width = '100%';
		if (note) {
			row.badge.title = note;
			errorLine.textContent = `${name}: ${note}`;
		}
	}

	function renderProgress(snapshot) {
		const pct = snapshot.total ? Math.round((snapshot.done / snapshot.total) * 100) : 0;
		progressFill.style.width = `${pct}%`;
		const parts = [`${snapshot.done}/${snapshot.total} files`];
		if (snapshot.current) parts.push(`${copy.verb.toLowerCase()} ${snapshot.current}…`);
		if (snapshot.bytes) parts.push(formatBytes(snapshot.bytes));
		statusLine.textContent = parts.join(' · ');
	}

	async function runTransfer() {
		errorLine.textContent = '';
		retryBtn.disabled = true;
		startBtn.disabled = true;
		startBtn.textContent = 'Transferring…';
		cancelBtn.disabled = false;
		for (const name of rowByName.keys()) setRow(name, 'syncing');

		const source = direction === 'to-mac' ? driveVfs : macVfsFor(activeRoute);
		const target = direction === 'to-mac' ? macVfsFor(activeRoute) : driveVfs;
		try {
			const result = direction === 'to-mac'
				? await sendToMac(files, destInner, {
					driveVfs: source, macVfs: target, route: activeRoute, concurrency,
					signal: controller.signal,
					onProgress: renderProgress,
					onFile: item => setRow(item.name, item.status, item.error)
				})
				: await fetchFromMac(files, destInner, {
					driveVfs: target, macVfs: source, route: activeRoute, concurrency,
					signal: controller.signal,
					onProgress: renderProgress,
					onFile: item => setRow(item.name, item.status, item.error)
				});
			engine = result.engine;
			renderProgress(result);
			const failed = result.failed || 0;
			if (failed > 0 && !aborted) {
				statusLine.textContent = `${result.done}/${result.total} files moved · ${failed} failed — retry when ready.`;
				retryBtn.disabled = false;
			} else if (!aborted) {
				statusLine.textContent = `${result.done}/${result.total} files moved · ${formatBytes(result.bytes)} · via ${result.providerName}.`;
			}
			try { onDone(result); } catch (_ignored) {}
		} catch (error) {
			errorLine.textContent = error?.message || String(error);
		} finally {
			startBtn.textContent = 'Start transfer';
			startBtn.disabled = false;
			cancelBtn.disabled = true;
		}
	}

	startBtn.addEventListener('click', () => {
		if (engine && !engine.state.finished) return;
		runTransfer();
	});
	retryBtn.addEventListener('click', async () => {
		if (!engine) return;
		const count = engine.retryFailed();
		if (count > 0) {
			for (const item of engine.items) {
				if (item.status === 'queued') setRow(item.name, 'syncing');
			}
			retryBtn.disabled = true;
			startBtn.disabled = true;
			// Re-run only the re-queued items through the same provider.
			const provider = selectProviderForRetry();
			await rerunFailed(provider);
		}
	});
	function selectProviderForRetry() {
		// Rebuild the same-shaped provider the first run used (vfs-copy today).
		const source = direction === 'to-mac' ? driveVfs : macVfsFor(activeRoute);
		const target = direction === 'to-mac' ? macVfsFor(activeRoute) : driveVfs;
		return createVfsCopyProvider({ read: source.read, write: target.write });
	}
	async function rerunFailed(provider) {
		const again = createTransferEngine({
			provider,
			plan: engine.items
				.filter(item => item.status === 'queued')
				.map(item => ({ src: item.src, dest: item.dest, name: item.name })),
			concurrency,
			onProgress: renderProgress,
			onFile: item => {
				const original = engine.items.find(entry => entry.name === item.name && entry.src === item.src);
				if (original) {
					original.status = item.status;
					original.error = item.error;
					original.bytes = item.bytes;
				}
				setRow(item.name, item.status, item.error);
			},
			signal: controller.signal
		});
		const result = await again.start();
		renderProgress({ ...result, total: engine.items.length, done: engine.items.filter(i => i.status === 'done').length });
		if (result.failed > 0) retryBtn.disabled = false;
		else statusLine.textContent = `All ${engine.items.length} files moved · ${formatBytes(result.bytes)}.`;
		startBtn.disabled = false;
	}

	function close() {
		controller.abort();
		aborted = true;
		overlay.remove();
	}
	closeBtn.addEventListener('click', close);
	cancelBtn.addEventListener('click', () => {
		controller.abort();
		aborted = true;
		statusLine.textContent = 'Cancelled.';
	});
	cancelBtn.disabled = true;

	resetPicker();
	const enginePromise = startOnOpen ? runTransfer() : Promise.resolve(null);
	return {
		close,
		enginePromise,
		get engine() { return engine; }
	};
}

function formatBytes(bytes = 0) {
	const value = Number(bytes) || 0;
	if (value < 1024) return `${value} B`;
	const units = ['KB', 'MB', 'GB'];
	let scaled = value / 1024;
	let unit = 0;
	while (scaled >= 1024 && unit < units.length - 1) { scaled /= 1024; unit += 1; }
	return `${scaled.toFixed(1)} ${units[unit]}`;
}
