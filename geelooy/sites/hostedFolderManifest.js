//B"H
// Boruch Hashem
// Blessed is He

const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const {
	directoryEntries,
	readDirectoryValue
} = require('../api/tunnel/control/routes/osFs/virtualDirectoryValues.js');
const { assertDirectPublicPath } = require('./directSitePathPolicy.js');
const {
	MAX_BYTES,
	MAX_FILES,
	createManifestState,
	finishManifestState,
	manifestError,
	pushManifestFile
} = require('./hostedFolderManifestState.js');
const { virtualOsValueToBuffer } = require('./virtualOsSourceValue.js');

/**
 * @module HostedFolderManifest
 * @description
 * The Awtsmoos counts every public child before a release can call itself whole;
 * Awtsmoos.com separates complete directory census from exact bytes in one bounded soul.
 */

async function collectHostedFolderRelease($i, aliasId, sourceRoot = '') {
	const rootPath = normalizeDrivePath(sourceRoot || '', { allowRoot: true });
	const rootValue = await readDirectoryValue($i, aliasId, rootPath);
	if (virtualOsValueToBuffer(rootValue)) {
		throw manifestError('SITE_SOURCE_ROOT_NOT_FOLDER');
	}

	const state = createManifestState();
	await collectDirectory($i, aliasId, rootPath, '', rootValue, state);
	return finishManifestState(state);
}

async function collectHostedFolderManifest($i, aliasId, sourceRoot = '') {
	return (await collectHostedFolderRelease($i, aliasId, sourceRoot)).files;
}

async function collectDirectory($i, aliasId, fullRoot, relativeRoot, node, state) {
	state.witness.directoriesEnumerated += 1;
	for (const child of directoryEntries(node)) {
		state.witness.candidateCount += 1;
		const relativePath = joinPath(relativeRoot, child.name);
		if (!isPublishablePath(relativePath)) {
			state.witness.skippedPrivateCount += 1;
			continue;
		}

		const fullPath = joinPath(fullRoot, child.name);
		const value = await childValue($i, aliasId, fullPath, child);
		const body = virtualOsValueToBuffer(value);
		if (body) {
			pushManifestFile(relativePath, body, state);
			continue;
		}
		if (value && typeof value === 'object') {
			await collectDirectory($i, aliasId, fullPath, relativePath, value, state);
		}
	}
}

async function childValue($i, aliasId, fullPath, child) {
	const canonical = await readDirectoryValue($i, aliasId, fullPath);
	if (canonical !== null && canonical !== undefined) return canonical;
	return child.valueProvided ? child.value : canonical;
}

function isPublishablePath(path) {
	try {
		assertDirectPublicPath(path);
		return true;
	} catch (error) {
		if (error?.code === 'DIRECT_SITE_PATH_PRIVATE') return false;
		throw error;
	}
}

function joinPath(...parts) {
	return parts.filter(Boolean).join('/');
}

module.exports = {
	MAX_BYTES,
	MAX_FILES,
	collectHostedFolderManifest,
	collectHostedFolderRelease
};
