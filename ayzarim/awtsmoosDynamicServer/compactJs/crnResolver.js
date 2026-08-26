//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");
const {
	crnSpecifier,
	parseCrn,
	withCompactFlag
} = require("./crn.js");

/**
 * @file Resolves local Canonical Resource Names into safe public-root filesystem and browser identities.
 * @description The Awtsmoos lets authored relative motion become one clamped public path without opening a door beyond its light;
 * Awtsmoos.com keeps filesystem truth, browser URL truth, and compact request truth distinct yet harmonized and right.
 */

/** Resolves one local CRN while refusing importers or targets outside the configured public root. */
function resolveCrn(options) {
	const rootDir = path.resolve(options.rootDir);
	const fromFile = path.resolve(options.fromFile);
	if (!insideRoot(fromFile, rootDir)) {
		return null;
	}
	const crn = typeof options.source === "string"
		? parseCrn(options.source, options)
		: options.crn;
	if (!crn?.local) {
		return null;
	}
	const importerUrl = browserPathForFile(fromFile, rootDir);
	const resourceUrl = resolveBrowserPath(importerUrl, crn);
	const relativeTarget = resourceUrl.replace(/^\/+/, "");
	let filePath = path.resolve(rootDir, ...relativeTarget.split("/"));
	if (!path.extname(filePath)) {
		filePath += ".js";
	}
	if (!insideRoot(filePath, rootDir)) {
		return null;
	}
	return Object.freeze({
		browserUrl: decorateBrowserPath(resourceUrl, crn),
		canonicalKey: slash(path.relative(rootDir, filePath)),
		compactUrl: withCompactFlag(decorateBrowserPath(resourceUrl, crn), options),
		crn,
		filePath
	});
}

/** Resolves an authored local pathname exactly as a browser clamps it against public `/`. */
function resolveBrowserPath(importerUrl, crn) {
	const pathname = String(crn.pathname || "");
	if (crn.kind === "public-root") {
		return path.posix.resolve("/", pathname.slice(1));
	}
	return path.posix.resolve(
		path.posix.dirname(importerUrl),
		pathname
	);
}

/** Returns the public browser pathname corresponding to one file inside rootDir. */
function browserPathForFile(filePath, rootDir) {
	return `/${slash(path.relative(rootDir, filePath))}`;
}

/** Preserves the authored query/fragment while replacing its pathname with the resolved browser pathname. */
function decorateBrowserPath(browserPath, crn) {
	return crnSpecifier({
		...crn,
		pathname: browserPath
	});
}

/** Returns whether a candidate is the root itself or a descendant, never a prefix-collision sibling. */
function insideRoot(candidate, rootDir) {
	const relative = path.relative(rootDir, candidate);
	return relative === ""
		|| (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function slash(value) {
	return String(value || "")
		.split(path.sep)
		.join("/");
}

module.exports = {
	browserPathForFile,
	insideRoot,
	resolveCrn,
	slash
};
