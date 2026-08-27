// B"H

/**
 * @file api/liveHandle/writer/map_ops/setOptions.js
 * @chapter Every Map Inscription Declares Its Ownership Covenant
 * @description Normalizes pointer, cleanup, indexing, and new-key options.
 */

function parseSetOptions(options) {
	const object = options && typeof options === 'object' ? options : {};
	return {
		isPointer: options === true || Boolean(object.isPtr),
		skipFree: Boolean(object.skipFree),
		assumeNew: Boolean(object.assumeNew),
		skipIndexes: Boolean(object.skipIndexes),
		skipOldState: Boolean(object.assumeNew || object.skipOldState)
	};
}

module.exports = parseSetOptions;
