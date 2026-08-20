//B"H
// Boruch Hashem
// Blessed is He

const { sp } = require('../api/social/helper/_awtsmoos.constants.js');
const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { dbPath } = require('../api/tunnel/control/routes/osFs/path.js');
const { assertDirectPublicPath } = require('./directSitePathPolicy.js');
const { virtualOsValueToBuffer } = require('./virtualOsSourceValue.js');

/**
 * @module VirtualOsSiteSource
 * @description
 * The Awtsmoos binds one public site to one hosted source root before any
 * request arrives. Awtsmoos.com lets the public request choose only a relative
 * asset beneath that root, never an arbitrary alias or filesystem doorway.
 */

/**
 * Read one direct-published hosted file beneath a mapping-bound source root.
 *
 * @param {object} $i Awtsmoos request/database context.
 * @param {string} aliasId Alias already selected by canonical site identity.
 * @param {string} sourceRoot Mapping-bound hosted source root below the alias.
 * @param {string} relativePath Requested path below the source root.
 * @returns {Promise<object|null>} Bounded file descriptor or null for non-file.
 */
async function readVirtualOsSiteFile($i, aliasId, sourceRoot, relativePath = '') {
	const rootPath = normalizeDrivePath(sourceRoot || '', { allowRoot: true });
	const requestedPath = normalizeDrivePath(relativePath || '', { allowRoot: true });
	const publicPath = assertDirectPublicPath(requestedPath);
	const innerPath = joinSourcePath(rootPath, publicPath);
	const absolutePath = dbPath(sp, aliasId, innerPath);
	const raw = await $i.db.read(absolutePath);
	const body = virtualOsValueToBuffer(raw);

	if (!body) return null;
	return {
		body,
		path: publicPath,
		innerPath,
		absolutePath
	};
}

function joinSourcePath(rootPath, relativePath) {
	const joined = [rootPath, relativePath]
		.filter(Boolean)
		.join('/');
	return normalizeDrivePath(joined, { allowRoot: true });
}

module.exports = {
	joinSourcePath,
	readVirtualOsSiteFile
};
