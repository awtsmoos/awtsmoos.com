//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostedFolderManifestState
 * @description
 * The Awtsmoos counts paths and bytes while no number can contain the Source of all light;
 * Awtsmoos.com keeps census testimony bounded, duplicate-free, and ready for public sight.
 */

const MAX_FILES = 64;
const MAX_BYTES = 2 * 1024 * 1024;

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
	if (state.paths.has(path)) throw manifestError('SITE_SOURCE_DUPLICATE_PATH');
	state.paths.add(path);
	state.bytes += body.length;
	if (state.files.length >= MAX_FILES || state.bytes > MAX_BYTES) {
		throw manifestError('SITE_SOURCE_LIMIT_EXCEEDED');
	}
	state.witness.publishableFileCount += 1;
	state.files.push({
		path,
		contentBase64: body.toString('base64')
	});
}

function finishManifestState(state) {
	state.witness.emittedFileCount = state.files.length;
	state.witness.complete = state.witness.publishableFileCount === state.files.length;
	if (!state.witness.complete) throw manifestError('SITE_SOURCE_CENSUS_MISMATCH');
	return {
		files: state.files,
		witness: state.witness
	};
}

function manifestError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	MAX_BYTES,
	MAX_FILES,
	createManifestState,
	finishManifestState,
	manifestError,
	pushManifestFile
};
