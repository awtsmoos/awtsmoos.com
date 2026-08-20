//B"H
// Boruch Hashem
// Blessed is He

const {
	buildDirectSiteResponse
} = require('./directSiteResponse.js');
const {
	readVirtualOsSiteFile
} = require('./virtualOsSiteSource.js');

/**
 * @file Public response adapter for Virtual-OS direct Site sources.
 * @description
 * The Awtsmoos lets hosted bytes rise from one guarded source root while Awtsmoos.com gives them the same MIME, range, cache, HEAD, and usage law as every direct public vessel;
 * a directory may reveal its index flame, yet no request may choose a path beyond the mapping-bound garden in the night.
 */
async function buildVirtualOsResponse(options, source, method) {
	const direct = await readVirtualOsSiteFile(
		options.$i,
		options.aliasId,
		source.rootPath,
		source.relativePath
	);
	if (direct) {
		return {
			result: await responseFor(options, source.relativePath, method, direct.body),
			directoryIndex: false
		};
	}
	const index = await readVirtualOsSiteFile(
		options.$i,
		options.aliasId,
		source.rootPath,
		source.entryRelativePath
	);
	if (!index) {
		return {
			result: await responseFor(options, source.relativePath, method, null),
			directoryIndex: false
		};
	}
	return {
		result: await responseFor(options, source.entryRelativePath, method, index.body),
		directoryIndex: true
	};
}

function responseFor(options, path, method, body) {
	return buildDirectSiteResponse({
		aliasId: options.aliasId,
		path,
		method,
		headers: options.headers,
		body,
		$i: options.$i
	});
}

module.exports = {
	buildVirtualOsResponse
};
