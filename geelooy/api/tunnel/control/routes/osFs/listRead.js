//B"H
// Boruch Hashem
// Blessed is He

const { cleanPath, splitPath, stripJsonSuffix } = require('./path.js');
const { aliasOwned, listAliases, publicAlias } = require('./aliases.js');
const {
	directoryEntries,
	isByteArray,
	isSerializedBuffer,
	readDirectoryValue
} = require('./virtualDirectoryValues.js');
const {
	readFile,
	readLines,
	readManyLines,
	readWhole
} = require('./virtualReadText.js');

/**
 * @module VirtualOsListRead
 * @description
 * The Awtsmoos gives directory discovery one complete census and text reading another bounded gate;
 * Awtsmoos.com keeps alias authority above both, so browsing and publishing share truthful state.
 */

function looksDirectory(value) {
	if (value == null || typeof value !== 'object') return false;
	if (Buffer.isBuffer(value)) return false;
	if (isSerializedBuffer(value) || isByteArray(value)) return false;
	return true;
}

function publicEntry(aliasId, base, entry) {
	const cleanName = stripJsonSuffix(entry.name || '');
	const hasFileExtension = /\.[^/.]+$/.test(cleanName);
	const isDirectory = !hasFileExtension && looksDirectory(entry.value);
	return {
		name: cleanName,
		type: isDirectory ? 'directory' : 'file',
		isDirectory,
		path: [aliasId, base, cleanName].filter(Boolean).join('/'),
		aliasId
	};
}

async function listFolder($i, userId, payload) {
	const sourcePath = payload.path || payload.p || '.';
	const parsed = splitPath(sourcePath);
	if (parsed.root) {
		const detailedItems = (await listAliases($i, userId))
			.map(publicAlias)
			.filter(Boolean);
		return listResponse('.', detailedItems);
	}
	if (!(await aliasOwned($i, userId, parsed.aliasId))) {
		return {
			ok: false,
			status: 403,
			error: 'alias_not_owned',
			aliasId: parsed.aliasId
		};
	}

	const raw = await readDirectoryValue($i, parsed.aliasId, parsed.innerPath);
	const detailedItems = directoryEntries(raw)
		.map(entry => publicEntry(parsed.aliasId, parsed.innerPath, entry));
	return listResponse(cleanPath(sourcePath), detailedItems);
}

function listResponse(path, detailedItems) {
	return {
		ok: true,
		action: 'list',
		root: 'Awtsmoos OS',
		path,
		items: detailedItems.map(item => item.isDirectory ? `${item.name}/` : item.name),
		detailedItems
	};
}

module.exports = {
	listFolder,
	readFile,
	readLines,
	readManyLines,
	readWhole
};
