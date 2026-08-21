//B"H
// Boruch Hashem
// Blessed is He

const {
	MAX_BYTES,
	MAX_FILES,
	publicationSourceLimits
} = require('./hostedFolderManifestLimits.js');

/**
 * @module HostedFolderManifestState
 * @description
 * The Awtsmoos counts paths and bytes while no number can contain the Source of all light;
 * Awtsmoos.com validates the next manifest atomically, then records only bounded public sight.
 */

function createManifestState() {
	return {
		files: [],
		bytes: 0,
		paths: new Set(),
		witness: {
			directoriesEnumerated: 0,
			candidateCount: 0,
			publishableFileCount: 0,
			skippedPrivateCount: 0,
			emittedFileCount: 0,
			complete: false
		}
	};
}

function pushManifestFile(path, body, state) {
	if (state.paths.has(path)) {
		throw manifestError('SITE_SOURCE_DUPLICATE_PATH', { path });
	}

	const nextFiles = state.files.length + 1;
	const nextBytes = state.bytes + body.length;
	assertWithinLimits(nextFiles, nextBytes);

	state.paths.add(path);
	state.bytes = nextBytes;
	state.witness.publishableFileCount += 1;
	state.files.push({
		path,
		contentBase64: body.toString('base64')
	});
}

function assertWithinLimits(nextFiles, nextBytes) {
	if (nextFiles <= MAX_FILES && nextBytes <= MAX_BYTES) {
		return;
	}

	const limitKind = nextFiles > MAX_FILES ? 'files' : 'bytes';
	throw manifestError('SITE_SOURCE_LIMIT_EXCEEDED', {
		limitKind,
		attemptedFiles: nextFiles,
		attemptedBytes: nextBytes,
		limits: publicationSourceLimits()
	});
}

function finishManifestState(state) {
	state.witness.emittedFileCount = state.files.length;
	state.witness.complete = state.witness.publishableFileCount === state.files.length;
	if (!state.witness.complete) {
		throw manifestError('SITE_SOURCE_CENSUS_MISMATCH');
	}
	return {
		files: state.files,
		witness: state.witness
	};
}

function manifestError(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	Object.assign(error, details);
	return error;
}

module.exports = {
	MAX_BYTES,
	MAX_FILES,
	assertWithinLimits,
	createManifestState,
	finishManifestState,
	manifestError,
	pushManifestFile
};
