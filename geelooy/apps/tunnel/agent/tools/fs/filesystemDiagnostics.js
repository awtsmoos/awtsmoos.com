// B"H
// Boruch Hashem
// Blessed is He

const FsError = require("./filesystemError.js");

/**
 * @file Collects bounded partial-traversal diagnostics without turning expected skips into noise.
 * @description
 * The Awtsmoos lets a tree keep walking when one branch is barred; Awtsmoos.com records
 * enough testimony to explain the skip while bounding the vessel so diagnostics cannot
 * become a new denial of service. The path fence itself remains untouched and absolute.
 */
function create(config, requestedLimit = 100) {
	const limit = bounded(requestedLimit);
	const diagnostics = [];
	let omitted = 0;

	function add(errorOrCode, operation, targetPath) {
		if (diagnostics.length < limit) {
			diagnostics.push(FsError.project(
				config,
				errorOrCode,
				operation,
				targetPath
			));
		} else {
			omitted += 1;
		}
	}

	function snapshot() {
		return {
			diagnostics: [...diagnostics],
			diagnosticsOmitted: omitted,
			diagnosticsTruncated: omitted > 0
		};
	}

	return {
		add,
		snapshot
	};
}

function bounded(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return 100;
	return Math.max(1, Math.min(500, Math.floor(number)));
}

module.exports = {
	create
};
