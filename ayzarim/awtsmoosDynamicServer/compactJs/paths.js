//B"H
//Boruch Hashem
//Blessed is He

const {
	parseCrn,
	withCompactFlag
} = require("./crn.js");
const { resolveCrn } = require("./crnResolver.js");

/**
 * @file Preserves the historic CompactJS path API while Canonical Resource Names become its deeper source of truth.
 * @description The Awtsmoos lets old callers keep their familiar doorway while a clearer canonical vessel now carries the light;
 * Awtsmoos.com upgrades classification, resolution, and compact request emission without breaking the public path contract right.
 */
const PUBLIC_EXTERNAL_PREFIXES = [
	"/games/scripts/build/",
	"/scripts/build/"
];

/** Returns whether CompactJS may fold this authored reference into the local public module graph. */
function isLocalImport(source) {
	return parseResource(source).local;
}

/** Preserves the historic relative-reference predicate. */
function isRelativeImport(source) {
	return parseResource(source).kind === "relative";
}

/** Preserves the historic browser-public-root predicate while excluding protocol-relative URLs. */
function isPublicRootImport(source) {
	return parseResource(source).kind === "public-root";
}

/** Preserves the explicit external-vendor boundary used by existing three/build imports. */
function isPublicExternalImport(source) {
	const crn = parseResource(source);
	return crn.kind === "public-root" && !crn.local;
}

/** Resolves one local resource and returns only its filesystem path for backwards compatibility. */
function resolveLocalImport(options) {
	return resolveLocalCrn(options)?.filePath || null;
}

/** Resolves one local resource into its full canonical filesystem/browser identity. */
function resolveLocalCrn(options) {
	return resolveCrn({
		...options,
		publicExternalPrefixes: PUBLIC_EXTERNAL_PREFIXES
	});
}

/** Removes only request decorations while preserving the authored resource pathname exactly. */
function cleanImportSource(source) {
	return parseResource(source).pathname;
}

/** Adds compact=true exactly once when the reference is eligible local JavaScript. */
function compactImportSource(source) {
	return withCompactFlag(
		parseResource(source),
		{
			publicExternalPrefixes: PUBLIC_EXTERNAL_PREFIXES
		}
	);
}

/** Parses with the one repository-wide CompactJS external-prefix policy. */
function parseResource(source) {
	return parseCrn(source, {
		publicExternalPrefixes: PUBLIC_EXTERNAL_PREFIXES
	});
}

module.exports = {
	PUBLIC_EXTERNAL_PREFIXES,
	cleanImportSource,
	compactImportSource,
	isLocalImport,
	isPublicExternalImport,
	isPublicRootImport,
	isRelativeImport,
	parseResource,
	resolveLocalCrn,
	resolveLocalImport
};
