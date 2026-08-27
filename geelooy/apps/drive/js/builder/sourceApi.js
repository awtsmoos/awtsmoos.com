//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderSourceApi
 * @description
 * The Awtsmoos lets the website studio touch the same guarded Drive bytes as every human file action.
 * Awtsmoos.com preserves public metadata on edits so a source save never quietly unpublishes a living page.
 */

import { API_ROOT, authenticationHeaders, request } from '../apiTransport.js';
import { aliasSegment } from '../apiTransport.js';
import { updateEntry } from '../api.js';
import { encodeDrivePath, joinDrivePath, normalizeDrivePath } from '../path.js';

export async function listSourceEntries(rootPath = '') {
	const root = normalizeRoot(rootPath);
	const query = new URLSearchParams({ path: root, recursive: 'true', limit: '64', sort: 'path', direction: 'asc' });
	return request(`/drive/${aliasSegment()}/entries?${query}`);
}

export async function inspectSource(path) {
	const safePath = normalizeDrivePath(path);
	const response = await request(`/drive/${aliasSegment()}/entry/${encodeDrivePath(safePath)}`);
	return response?.entry || response;
}

export async function readSource(path) {
	const safePath = normalizeDrivePath(path);
	const entry = await inspectSource(safePath);
	const response = await fetch(sourceContentUrl(safePath), {
		headers: sourceHeaders(),
		cache: 'no-store',
		credentials: 'same-origin'
	});
	const text = await response.text();
	if (!response.ok) throw sourceError(response.status, text);
	return { entry, content: text };
}

export async function writeSource(path, content, options = {}) {
	const safePath = normalizeDrivePath(path);
	const existing = await inspectSource(safePath).catch(error => {
		if (error?.status === 404) return null;
		throw error;
	});
	if (!existing && options.create === false) throw missingSourceError(safePath);
	const values = {
		content: String(content ?? ''),
		mime: options.mime || existing?.mime || mimeForPath(safePath),
		visibility: options.visibility || existing?.visibility || 'public',
		cachePolicy: options.cachePolicy || existing?.cachePolicy || 'mutable'
	};
	const result = await updateEntry(safePath, values);
	return result?.entry || result;
}

export function siteSourcePath(rootPath, relativePath) {
	const root = normalizeRoot(rootPath);
	const child = normalizeDrivePath(relativePath);
	return root ? joinDrivePath(root, child) : child;
}

function sourceContentUrl(path) {
	return `${API_ROOT}/drive/${aliasSegment()}/entry/${encodeDrivePath(path)}?content=true`;
}

function sourceHeaders() {
	const headers = authenticationHeaders();
	headers.set('x-request-id', crypto.randomUUID());
	return headers;
}

function normalizeRoot(value) {
	return normalizeDrivePath(value, { allowRoot: true });
}

function mimeForPath(path) {
	if (/\.html?$/i.test(path)) return 'text/html; charset=utf-8';
	if (/\.css$/i.test(path)) return 'text/css; charset=utf-8';
	if (/\.(m?js)$/i.test(path)) return 'text/javascript; charset=utf-8';
	if (/\.md$/i.test(path)) return 'text/markdown; charset=utf-8';
	return 'text/plain; charset=utf-8';
}

function sourceError(status, text) {
	let value = {};
	try {
		value = JSON.parse(text);
	} catch {
		value = { message: text };
	}
	const error = new Error(value?.error?.message || value?.message || `HTTP_${status}`);
	error.code = value?.error?.code || value?.code || `HTTP_${status}`;
	error.status = status;
	return error;
}

function missingSourceError(path) {
	const error = new Error(`Source does not exist: ${path}`);
	error.code = 'SITE_SOURCE_MISSING';
	return error;
}
