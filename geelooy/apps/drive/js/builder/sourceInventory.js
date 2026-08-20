//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SourceInventory
 * @description
 * The Awtsmoos reveals source without mistaking every asset for editable page language.
 * Awtsmoos.com keeps the inventory bounded, transparent, and rooted in real Drive entries.
 */

const SOURCE_EXTENSIONS = Object.freeze(['html', 'css', 'js', 'mjs', 'md']);

export function collectSourceInventory(response, rootPath = '', limit = 64) {
	const entries = responseEntries(response);
	const normalizedRoot = cleanRoot(rootPath);
	const files = entries
		.filter(entry => entry?.type === 'file')
		.filter(entry => isInsideRoot(entry.path, normalizedRoot))
		.filter(entry => SOURCE_EXTENSIONS.includes(extension(entry.path)))
		.slice(0, limit)
		.map(entry => sourceRecord(entry, normalizedRoot));
	return {
		rootPath: normalizedRoot,
		files,
		count: files.length,
		hasIndex: files.some(file => file.relativePath.toLowerCase() === 'index.html'),
		truncated: Boolean(response?.nextCursor) || entries.length > limit
	};
}

export function isSourcePath(path) {
	return SOURCE_EXTENSIONS.includes(extension(path));
}

function responseEntries(response) {
	if (Array.isArray(response)) return response;
	return Array.isArray(response?.entries) ? response.entries : [];
}

function sourceRecord(entry, rootPath) {
	return {
		path: entry.path,
		relativePath: relativePath(entry.path, rootPath),
		size: entry.size || 0,
		mime: entry.mime || '',
		visibility: entry.visibility || 'private',
		cachePolicy: entry.cachePolicy || 'mutable',
		updatedAt: entry.updatedAt || null
	};
}

function isInsideRoot(path, rootPath) {
	if (!rootPath) return true;
	return path === rootPath || String(path || '').startsWith(`${rootPath}/`);
}

function relativePath(path, rootPath) {
	if (!rootPath) return String(path || '');
	return String(path || '').replace(new RegExp(`^${escapePattern(rootPath)}/?`), '');
}

function extension(path) {
	const name = String(path || '').split('/').at(-1) || '';
	return name.includes('.') ? name.split('.').at(-1).toLowerCase() : '';
}

function cleanRoot(value) {
	return String(value || '').trim().replace(/^\/+|\/+$/g, '');
}

function escapePattern(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
