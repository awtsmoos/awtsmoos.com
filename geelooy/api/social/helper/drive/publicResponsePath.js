//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module publicResponsePath
 * @description
 * Public path resolution response for drive entries.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { readDriveState } = require('./stateRepository.js');
const { notFoundResponse } = require('./publicResponseHeaders.js');

const { buildDirectoryListing } = require('./publicResponseListing.js');
const { buildEntryResponse, isPublicFile } = require('./publicResponseEntry.js');

async function buildPublicPathResponse(options) {
	const state = await readDriveState(options.aliasId, options.$i);
	let logicalPath = normalizeDrivePath(options.path || '', { allowRoot: true });
	let entry = state.entries[logicalPath];
	if (!logicalPath || entry?.type === 'folder') {
		logicalPath = logicalPath ? `${logicalPath}/index.html` : 'index.html';
		entry = state.entries[logicalPath];
		// B"H 2026-10-13: No index.html — render a browsable directory listing.
		if (!isPublicFile(entry)) {
			const dirPath = normalizeDrivePath(options.path || '', { allowRoot: true });
			return buildDirectoryListing({
				aliasId: options.aliasId,
				dirPath,
				state,
				method: options.method,
				$i: options.$i
			});
		}
	}
	if (!isPublicFile(entry)) return notFoundResponse();
	return buildEntryResponse({ ...options, entry });
}

module.exports = {
	buildPublicPathResponse
};
