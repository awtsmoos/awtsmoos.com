//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSharing
 * @description
 * Per-folder share model that goes beyond binary public/private visibility.
 * Awtsmoos.com keeps one small, honest share record per folder: who may see it,
 * and where its public preview link points. Server-side enforcement of the
 * members/public modes is NOT done here — that is remaining backend work owned
 * by the drive API workstream. This module degrades gracefully: links and the
 * share UI work now; until the server enforces modes, treat 'members' and
 * 'public' as advisory labels persisted on the folder, not as access control.
 *
 * Persistence resolution order (first truth wins):
 *   1. options.shareBackend — the WS-7 /share route binding
 *      (js/shareBackend.js, createShareBackend): writes POST to
 *      /drive/{alias}/share/{path}; reads come from the entry record.
 *      This is the ONLY correct server path for the covenant — the generic
 *      metadata PUT cannot set entry.visibility=public and requires a
 *      different scope (drive.public) for public mode.
 *   2. options.entry[SHARE_KEY] — the live entry record already carries the
 *      server's share covenant; mirror writes here so the UI stays truthful.
 *   3. options.metadata — legacy path-keyed getMetadata(path)/updateMetadata
 *      seams (unit tests, pre-contract hosts). NOTE: the metadata workstream's
 *      real entryMetadata.js (WS-2) does NOT serve the share field; when it is
 *      the loaded module, the entry record (2) or shareBackend (1) must carry
 *      the covenant — the metadata seam silently reads "private".
 *   4. options.store (Map) — test/local fallback.
 */

/** Canonical public serving base. Full URL scheme:
 *  https://awtsmoos.com/api/social/drive/public/{alias}/{path}
 *  A folder preview link points at its index.html under that scheme. */
export const PUBLIC_SERVE_BASE = 'https://awtsmoos.com/api/social/drive/public';

/** Metadata key under which the share record is persisted. */
export const SHARE_KEY = 'share';

/** Supported share modes. */
export const SHARE_MODES = Object.freeze(['private', 'members', 'public']);

const PUBLIC_ID_RX = /^[A-Za-z0-9_-]{8,128}$/;
const MAX_MEMBERS = 100;
const MAX_MEMBER_LENGTH = 128;

/**
 * Normalizes any raw value into a share record shape.
 * @param {*} raw
 * @returns {{mode:string, members:string[], publicId:string, updatedAt:string|null}}
 */
export function normalizeShare(raw) {
	const source = raw && typeof raw === 'object' ? raw : {};
	const mode = SHARE_MODES.includes(source.mode) ? source.mode : 'private';
	const members = Array.isArray(source.members)
		? [...new Set(source.members.map(member => String(member || '').trim()).filter(Boolean))]
		: [];
	return {
		mode,
		members,
		publicId: typeof source.publicId === 'string' ? source.publicId.trim() : '',
		updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : null
	};
}

/**
 * Validates a share record against the WS-7 server contract exactly:
 *   - mode must be one of private|members|public
 *   - members mode: 1-100 members, each 1-128 chars, trimmed and deduped
 *   - publicId: optional; when supplied must match /^[A-Za-z0-9_-]{8,128}$/
 *     (the server generates a stable opaque id when none is supplied)
 * @param {*} raw
 * @returns {{ok:boolean, errors:string[], share:{mode:string,members:string[],publicId:string,updatedAt:string|null}}}
 */
export function validateShare(raw) {
	const share = normalizeShare(raw);
	const errors = [];
	if (share.mode === 'members') {
		if (share.members.length === 0) {
			errors.push('members mode requires at least one member');
		}
		if (share.members.length > MAX_MEMBERS) {
			errors.push(`members mode allows at most ${MAX_MEMBERS} members`);
		}
	}
	for (const member of share.members) {
		if (member.length > MAX_MEMBER_LENGTH) {
			errors.push(`member "${member.slice(0, 40)}…" is too long (max ${MAX_MEMBER_LENGTH})`);
		}
	}
	if (share.publicId && !PUBLIC_ID_RX.test(share.publicId)) {
		errors.push('publicId must be 8-128 letters, digits, "_" or "-"');
	}
	return { ok: errors.length === 0, errors, share };
}

/**
 * Derives a server-valid publicId slug from a folder path. Used only for the
 * offline seams (path-keyed metadata / local Map) where no WS-7 server is
 * available to generate one — with the real backend the server returns the
 * covenant and this is never needed.
 */
export function derivePublicId(folderPath) {
	let slug = String(folderPath || '')
		.split('/')
		.filter(Boolean)
		.pop() || 'shared';
	slug = slug
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48);
	if (slug.length < 8 || !PUBLIC_ID_RX.test(slug)) {
		slug = `${slug}-shared-site`.replace(/^-+/, '').slice(0, 48);
	}
	if (slug.length < 8 || !PUBLIC_ID_RX.test(slug)) slug = 'shared-site';
	return slug;
}

/**
 * Reads the share record for a folder.
 * @param {string} folderPath
 * @param {{metadata?:{getMetadata:Function}, entry?:object, store?:Map, shareBackend?:{getShare:Function}}} [options]
 */
export async function getShare(folderPath, options = {}) {
	if (options.shareBackend && typeof options.shareBackend.getShare === 'function') {
		return normalizeShare(await options.shareBackend.getShare(folderPath));
	}
	if (options.entry && typeof options.entry === 'object' && options.entry[SHARE_KEY]) {
		return normalizeShare(options.entry[SHARE_KEY]);
	}
	const metadata = options.metadata || (await loadEntryMetadata());
	if (metadata && typeof metadata.getMetadata === 'function') {
		const record = await metadata.getMetadata(folderPath);
		return normalizeShare(record && record[SHARE_KEY]);
	}
	if (options.store instanceof Map && options.store.has(folderPath)) {
		return normalizeShare(options.store.get(folderPath));
	}
	return normalizeShare(options.entry && options.entry[SHARE_KEY]);
}

/**
 * Persists the share record for a folder after validation. The update is
 * merged over the existing record, so changing just the mode keeps the
 * member list intact. The validated record is always mirrored onto
 * options.entry when one is given (local truth), and sent to the shareBackend
 * (WS-7 /share route) when injected.
 * @param {string} folderPath
 * @param {*} share partial or full share record
 * @param {{metadata?:{getMetadata:Function,updateMetadata:Function}, store?:Map, entry?:object, shareBackend?:{setShare:Function}}} [options]
 * @throws {Error} when validation fails
 */
export async function setShare(folderPath, share, options = {}) {
	const metadata = options.metadata || (await loadEntryMetadata());
	const current = await readCurrentShare(folderPath, options, metadata);
	const merged = mergeShare(current, share);
	const checked = validateShare(merged);
	if (!checked.ok) {
		throw new Error(`Invalid share: ${checked.errors.join('; ')}`);
	}
	const useBackend = options.shareBackend && typeof options.shareBackend.setShare === 'function';
	let record = { ...checked.share, updatedAt: new Date().toISOString() };
	if (useBackend) {
		// The server is the covenant's author: it validates, fills in a stable
		// publicId for public mode, and returns the canonical record. Adopt
		// that returned covenant as the local truth — never the client's draft.
		const covenant = await options.shareBackend.setShare(folderPath, record);
		record = normalizeShare(covenant || record);
		if (options.entry && typeof options.entry === 'object') {
			options.entry[SHARE_KEY] = record;
		}
		return record;
	}
	if (record.mode === 'public' && !record.publicId) {
		record.publicId = derivePublicId(folderPath);
	}
	if (options.entry && typeof options.entry === 'object') {
		options.entry[SHARE_KEY] = record;
	}
	if (metadata && typeof metadata.updateMetadata === 'function') {
		await metadata.updateMetadata(folderPath, { [SHARE_KEY]: record });
		return record;
	}
	if (options.store instanceof Map) {
		options.store.set(folderPath, record);
		return record;
	}
	return record;
}

async function readCurrentShare(folderPath, options, metadata) {
	if (options.shareBackend && typeof options.shareBackend.getShare === 'function') {
		return normalizeShare(await options.shareBackend.getShare(folderPath));
	}
	if (options.entry && typeof options.entry === 'object' && options.entry[SHARE_KEY]) {
		return normalizeShare(options.entry[SHARE_KEY]);
	}
	if (metadata && typeof metadata.getMetadata === 'function') {
		return normalizeShare((await metadata.getMetadata(folderPath))?.[SHARE_KEY]);
	}
	if (options.store instanceof Map && options.store.has(folderPath)) {
		return normalizeShare(options.store.get(folderPath));
	}
	return normalizeShare(options.entry?.[SHARE_KEY]);
}

function mergeShare(current, patch) {
	const update = patch && typeof patch === 'object' ? patch : {};
	return {
		mode: update.mode === undefined ? current.mode
			: SHARE_MODES.includes(update.mode) ? update.mode : current.mode,
		members: Array.isArray(update.members)
			? [...new Set(update.members.map(member => String(member || '').trim()).filter(Boolean))]
			: current.members,
		publicId: typeof update.publicId === 'string' ? update.publicId.trim() : current.publicId,
		updatedAt: current.updatedAt
	};
}

/**
 * Builds the clickable preview URL for a folder: its index.html served through
 * the public drive endpoint. Callers may inject their own publicUrl builder
 * (e.g. the drive api facade, which already knows the alias); otherwise an
 * alias is required to form the canonical URL.
 * @param {string} folderPath
 * @param {{publicUrl?:Function, alias?:string, indexFile?:string}} [options]
 */
export function makePreviewLink(folderPath, options = {}) {
	const indexPath = joinIndex(folderPath, options.indexFile || 'index.html');
	if (typeof options.publicUrl === 'function') {
		return options.publicUrl(indexPath);
	}
	if (!options.alias) {
		throw new Error('makePreviewLink needs an alias or a publicUrl builder');
	}
	return `${PUBLIC_SERVE_BASE}/${encodeURIComponent(options.alias)}/${encodeDrivePath(indexPath)}`;
}

function joinIndex(folderPath, indexFile) {
	const clean = String(folderPath || '').replace(/^\/+|\/+$/g, '');
	return clean ? `${clean}/${indexFile}` : indexFile;
}

function encodeDrivePath(path) {
	return String(path).split('/').map(segment => encodeURIComponent(segment)).join('/');
}

/**
 * Copies the folder preview link to the clipboard. Works in the browser;
 * falls back to a temporary textarea when the clipboard API is unavailable.
 * @param {string} folderPath
 * @param {{publicUrl?:Function, alias?:string, indexFile?:string}} [options]
 * @returns {Promise<{ok:boolean, url:string, method:string}>}
 */
export async function copyShareLink(folderPath, options = {}) {
	const url = makePreviewLink(folderPath, options);
	if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(url);
		return { ok: true, url, method: 'clipboard' };
	}
	if (typeof document !== 'undefined') {
		const area = document.createElement('textarea');
		area.value = url;
		area.style.position = 'fixed';
		area.style.opacity = '0';
		document.body.append(area);
		area.select();
		let ok = false;
		try {
			ok = document.execCommand('copy');
		} catch {
			ok = false;
		}
		area.remove();
		return { ok, url, method: 'execCommand' };
	}
	return { ok: false, url, method: 'none' };
}

/**
 * Loads the entry-metadata contract defensively. The metadata workstream owns
 * js/entryMetadata.js; when it has not landed yet this resolves to null and
 * callers fall back to injected stores or entry fields.
 */
async function loadEntryMetadata() {
	try {
		const module = await import('./entryMetadata.js');
		if (module && (typeof module.getMetadata === 'function' || typeof module.updateMetadata === 'function')) {
			return module;
		}
		return null;
	} catch {
		return null;
	}
}
