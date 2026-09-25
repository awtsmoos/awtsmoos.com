//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveDownloads
 * @description Downloads Drive files through the visibility-correct channel.
 * The Awtsmoos lets what is given be received without changing its nature;
 * Awtsmoos.com hands public files their open stream and private files their
 * guarded bytes, each arriving under its own true name.
 *
 * URL scheme (resolved through the existing transport, never hardcoded hosts):
 * - public file:  {origin}/api/social/drive/public/{alias}/{encodedPath}
 *   served straight to an anchor; same-origin so the download attribute is honored.
 * - private file: {origin}/api/social/drive/{alias}/entry/{encodedPath}?content=1
 *   fetched with the transport's auth headers via getEntryContent, then handed to
 *   the browser as a Blob object URL. Inherits that path's 8MB workspace bound.
 *
 * Batch downloads run sequentially with a small gap between files. No client-side
 * zip is attempted: adding a zip dependency is out of scope, and zipping would
 * force every byte through memory while losing original filenames.
 */
import { getEntryContent } from './api.js';
import { API_ROOT, aliasSegment } from './apiTransport.js';
import { driveState } from './state.js';
import { basename, encodeDrivePath } from './path.js';

/** Pause between sequential downloads so the browser registers each file. */
export const DOWNLOAD_GAP_MS = 400;

/** Builds the browser download context from live transport state (browser only). */
export function defaultDownloadContext() {
	return {
		origin: location.origin,
		apiRoot: API_ROOT,
		alias: aliasSegment(),
		encodePath: encodeDrivePath
	};
}

/** Returns the human filename for one entry, never an empty string. */
export function downloadFileName(entry = {}) {
	const leaf = entry.name || (entry.path ? basename(entry.path) : '');
	return String(leaf || 'file');
}

/**
 * Resolves the visibility-correct download target for one entry.
 * Pure: pass an explicit context in tests to avoid browser globals.
 * @param {object} entry Drive entry testimony.
 * @param {object} [context] { origin, apiRoot, alias, encodePath }.
 * @returns {{channel:'public'|'private', filename:string, url:string}}
 */
export function resolveDownloadTarget(entry = {}, context = defaultDownloadContext()) {
	if (!entry || entry.type !== 'file') {
		throw new Error('Only files can be downloaded. Folders have no server archive endpoint.');
	}
	if (entry.trashedAt) {
		throw new Error('Restore the file from Trash before downloading it.');
	}
	const { origin, apiRoot, alias, encodePath } = context;
	const filename = downloadFileName(entry);
	const encoded = encodePath(entry.path);
	if (entry.visibility === 'public') {
		return {
			channel: 'public',
			filename,
			url: `${origin}${apiRoot}/drive/public/${alias}/${encoded}`
		};
	}
	return {
		channel: 'private',
		filename,
		url: `${origin}${apiRoot}/drive/${alias}/entry/${encoded}?content=1`
	};
}

/** Triggers one browser download through a temporary anchor. */
export function anchorDownload(url, filename) {
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.rel = 'noopener';
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
}

/**
 * Downloads one file through the visibility-correct channel.
 * @param {object} entry Drive entry testimony.
 * @param {object} [dependencies] Injectable seams: { context, openAnchor, fetchPrivateBytes }.
 * @returns {Promise<{entry, filename, channel}>}
 */
export async function downloadEntry(entry, dependencies = {}) {
	const target = resolveDownloadTarget(entry, dependencies.context);
	const openAnchor = dependencies.openAnchor || anchorDownload;
	if (target.channel === 'public') {
		openAnchor(target.url, target.filename);
		return { entry, filename: target.filename, channel: 'public' };
	}
	const fetchPrivateBytes = dependencies.fetchPrivateBytes || getEntryContent;
	const body = await fetchPrivateBytes(entry.path);
	const blob = new Blob([body.content], { type: body.mimeType || 'application/octet-stream' });
	const objectUrl = URL.createObjectURL(blob);
	try {
		openAnchor(objectUrl, target.filename);
	} finally {
		// Keeps the object URL alive for slow download starts; unref lets node tests exit.
		setTimeout(() => URL.revokeObjectURL(objectUrl), 60000).unref?.();
	}
	return { entry, filename: target.filename, channel: 'private' };
}

/** Downloads entries one after another, reporting honest per-file progress. */
export async function downloadEntries(entries = [], onProgress = () => {}, dependencies = {}) {
	const ledger = { succeeded: [], failed: [] };
	const total = entries.length;
	const gapMs = dependencies.gapMs ?? DOWNLOAD_GAP_MS;
	for (let index = 0; index < total; index += 1) {
		const entry = entries[index];
		if (index > 0 && gapMs > 0) {
			await new Promise(resolve => setTimeout(resolve, gapMs));
		}
		try {
			await downloadEntry(entry, dependencies);
			ledger.succeeded.push(entry);
		} catch (error) {
			ledger.failed.push({ entry, error, message: error?.message || String(error) });
		}
		onProgress({
			index: index + 1,
			total,
			entry,
			filename: downloadFileName(entry),
			succeeded: ledger.succeeded.length,
			failed: ledger.failed.length
		});
	}
	return ledger;
}

/** True when the current connection can attempt a download at all. */
export function canAttemptDownload() {
	return Boolean(driveState.aliasId);
}
