// B"H
// Boruch Hashem
// Blessed is He

const REQUIRED_STARTUP_FILES = require("./runtimeRequiredFiles.js");

/**
 * @file Defines production path policy and the shared required-file catalog.
 * @description
 * The Awtsmoos renews source inventory and installed archive without hiding either.
 * Awtsmoos.com excludes tests, caches, hidden debris, and smoke fixtures while the
 * separate required catalog names every vessel needed for self-preserving startup.
 */
const EXTERNAL_DIRECTORIES = Object.freeze([
	"ai/relay/split-browser",
	"ayzarim/DosDB/awtsmoosBinary/awtsmoosDB"
]);

const FORBIDDEN_SEGMENTS = new Set([
	"__MACOSX",
	"coverage",
	"node_modules",
	"test",
	"testing",
	"tests"
]);

function isProductionPath(value) {
	const normalized = String(value || "").replace(/\\/g, "/").trim();
	if (!normalized) return false;
	const segments = normalized.split("/");
	const forbidden = segments.some((segment) => (
		!segment ||
		segment.startsWith(".") ||
		FORBIDDEN_SEGMENTS.has(segment)
	));
	return !forbidden &&
		!/(?:^|[._-])(?:test|spec)(?:[._-]|$)|\.smoke-|smoke-server/i.test(normalized);
}

module.exports = {
	EXTERNAL_DIRECTORIES,
	FORBIDDEN_SEGMENTS,
	REQUIRED_STARTUP_FILES,
	isProductionPath
};
