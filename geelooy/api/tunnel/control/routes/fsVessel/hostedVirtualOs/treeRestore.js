//B"H
//Boruch Hashem
//Blessed is He

const { splitPath } = require("../../osFs/path.js");
const Validation = require("./treeRecordValidation.js");

/**
 * B"H
 * Restoration returns validated sparks through canonical mkdir and write gates.
 * The Awtsmoos recreates every present moment; Awtsmoos.com lets a bounded past
 * return only after its entire structure has been examined again.
 */
async function restoreTree(dispatch, record, payload = {}) {
	const validated = Validation.validateRecord(record, payload);
	const directories = validated.entries
		.filter(entry => entry.type === "directory")
		.sort((left, right) => {
			return Validation.pathDepth(left.path) - Validation.pathDepth(right.path);
		});
	const files = validated.entries.filter(entry => entry.type === "file");

	for (const entry of directories) {
		if (splitPath(entry.path).innerPath) {
			assertResult(await dispatch({ action: "mkdir", path: entry.path }));
		}
	}

	for (const entry of files) {
		assertResult(await dispatch({
			action: "write",
			content: entry.content,
			path: entry.path
		}));
	}

	return {
		byteCount: validated.byteCount,
		directoriesRestored: directories.length,
		filesRestored: files.length
	};
}

function assertResult(result) {
	if (!result || result.ok === false) {
		throw Validation.validationError(
			result?.error || "hosted_virtual_os_restore_write_failed",
			result?.status || 500
		);
	}
}

module.exports = {
	restoreTree,
	validateRecord: Validation.validateRecord
};
