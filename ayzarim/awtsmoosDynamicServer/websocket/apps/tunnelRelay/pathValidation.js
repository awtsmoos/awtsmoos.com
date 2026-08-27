// B"H

const path = require("path");
const { cleanPathValue, shouldCheckPath } = require("./expectation.js");
const { actualPaths } = require("./responseIdentity.js");

function pathMatches(expectedPath, actualPath, root = "") {
	const expected = cleanPathValue(expectedPath);
	const actual = cleanPathValue(actualPath);
	if (!expected || !actual) return false;
	if (path.isAbsolute(expected)) return path.resolve(actual) === path.resolve(expected);
	if (actual === expected || actual.endsWith(`${path.sep}${expected}`)) return true;
	return Boolean(root) && path.resolve(actual) === path.resolve(root, expected);
}

function hasPathMismatch(expected = {}, data = {}) {
	if (!shouldCheckPath(expected.requestedAction)) return false;
	const expectedPaths = Array.isArray(expected.paths)
		? expected.paths
		: [expected.path].filter(Boolean);
	if (!expectedPaths.length) return false;
	const returnedPaths = actualPaths(data);
	if (!returnedPaths.length) return false;
	return expectedPaths.some(expectedPath => !returnedPaths.some(returnedPath =>
		pathMatches(expectedPath, returnedPath, expected.projectRoot)
	));
}

module.exports = { hasPathMismatch, pathMatches };
