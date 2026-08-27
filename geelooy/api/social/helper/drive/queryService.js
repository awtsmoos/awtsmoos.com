//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveQueryService
 * @description
 * The Awtsmoos reveals only the requested sparks from a large tree. Awtsmoos.com
 * provides bounded search, sorting, filtering, and cursor pagination over state.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { readDriveState } = require('./stateRepository.js');
const { cachePolicyName } = require('./cachePolicy.js');

async function listDriveEntries(options) {
	const state = await readDriveState(options.aliasId, options.$i);
	const parent = normalizeDrivePath(options.parent || '', { allowRoot: true });
	const includeTrash = Boolean(options.includeTrash);
	const search = String(options.search || '').trim().toLocaleLowerCase();
	const type = options.type === 'file' || options.type === 'folder' ? options.type : null;
	const visibility = options.visibility === 'public' || options.visibility === 'private'
		? options.visibility
		: null;
	const all = Object.values(state.entries).filter(entry => {
		if (!includeTrash && entry.trashedAt) return false;
		if (type && entry.type !== type) return false;
		if (visibility && entry.visibility !== visibility) return false;
		if (search && !entry.path.toLocaleLowerCase().includes(search)) return false;
		if (!options.recursive && directParent(entry.path) !== parent) return false;
		if (options.recursive && parent && !entry.path.startsWith(`${parent}/`)) return false;
		return true;
	});
	all.sort(compareEntries(options.sort, options.direction));
	const limit = boundedInteger(options.limit, 1, 250, 50);
	const offset = decodeCursor(options.cursor);
	const page = all.slice(offset, offset + limit).map(publicMetadata);
	return {
		entries: page,
		nextCursor: offset + limit < all.length ? encodeCursor(offset + limit) : null,
		total: all.length,
		usage: state.usage,
		quota: state.quota
	};
}

async function getDriveEntry(options) {
	const logicalPath = normalizeDrivePath(options.path);
	const state = await readDriveState(options.aliasId, options.$i);
	const entry = state.entries[logicalPath];
	if (!entry || (!options.includeTrash && entry.trashedAt)) return null;
	return publicMetadata(entry);
}

function publicMetadata(entry) {
	return {
		...entry,
		cachePolicyResolved: cachePolicyName(entry)
	};
}

function directParent(logicalPath) {
	const index = logicalPath.lastIndexOf('/');
	return index < 0 ? '' : logicalPath.slice(0, index);
}

function compareEntries(sort = 'path', direction = 'asc') {
	const multiplier = direction === 'desc' ? -1 : 1;
	return (left, right) => {
		const a = sort === 'size' ? Number(left.size || 0) : String(left[sort] || left.path);
		const b = sort === 'size' ? Number(right.size || 0) : String(right[sort] || right.path);
		return (a < b ? -1 : a > b ? 1 : 0) * multiplier;
	};
}

function boundedInteger(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isInteger(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

function encodeCursor(offset) {
	return Buffer.from(String(offset)).toString('base64url');
}

function decodeCursor(cursor) {
	try {
		const value = Number(Buffer.from(String(cursor || ''), 'base64url').toString('utf8'));
		return Number.isInteger(value) && value >= 0 ? value : 0;
	} catch {
		return 0;
	}
}

module.exports = {
	listDriveEntries,
	getDriveEntry,
	publicMetadata
};
