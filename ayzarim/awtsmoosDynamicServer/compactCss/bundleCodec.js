//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CompactCssBundleCodec
 * @description The Awtsmoos lets an ordered family of stylesheet paths travel as one bounded request;
 * Awtsmoos.com accepts both raw query text and the server's parsed JSON vessel while cascade identity stays manifest.
 */

const MAX_BUNDLE_ENTRIES = 64;
const MAX_BUNDLE_CHARACTERS = 8192;

/** Serializes one bounded ordered stylesheet list for a bundle query parameter. */
function serializeStylesheetBundle(sources) {
	const normalized = validateSources(sources);
	const serialized = JSON.stringify(normalized);
	if (serialized.length > MAX_BUNDLE_CHARACTERS) {
		throw new Error("CompactCSS bundle identity exceeds the supported size");
	}
	return serialized;
}

/** Parses and validates either raw JSON query text or an already parsed server query value. */
function parseStylesheetBundle(value) {
	if (Array.isArray(value)) {
		return validateSources(value);
	}
	const text = String(value || "");
	if (!text || text.length > MAX_BUNDLE_CHARACTERS) {
		throw new Error("CompactCSS bundle identity is empty or too large");
	}
	return validateSources(JSON.parse(text));
}

/** Adds compact=true without disturbing an existing bundle, query, or fragment. */
function withCompactCssFlag(source) {
	return decorateCssRequest(source, null, false);
}

/** Creates one compact request whose cache identity contains the full ordered source list. */
function createStylesheetBundleUrl(source, sources) {
	return decorateCssRequest(source, serializeStylesheetBundle(sources), true);
}

/** Creates a non-recursive child URL for semantic fallback imports. */
function createStylesheetChildUrl(source) {
	return decorateCssRequest(source, null, true);
}

/** Detects whether one stylesheet URL already represents a multi-entry bundle request. */
function hasStylesheetBundle(source) {
	const { query } = splitDecorations(source);
	return new URLSearchParams(query).has("bundle");
}

function decorateCssRequest(source, bundle, replaceBundle) {
	const { pathname, query, fragment } = splitDecorations(source);
	const parameters = new URLSearchParams(query);
	parameters.set("compact", "true");
	if (replaceBundle) {
		parameters.delete("bundle");
	}
	if (bundle !== null) {
		parameters.set("bundle", bundle);
	}
	const suffix = parameters.toString();
	return `${pathname}${suffix ? `?${suffix}` : ""}${fragment}`;
}

function splitDecorations(source) {
	const value = String(source || "");
	const hashIndex = value.indexOf("#");
	const withoutHash = hashIndex < 0 ? value : value.slice(0, hashIndex);
	const fragment = hashIndex < 0 ? "" : value.slice(hashIndex);
	const queryIndex = withoutHash.indexOf("?");
	return {
		pathname: queryIndex < 0 ? withoutHash : withoutHash.slice(0, queryIndex),
		query: queryIndex < 0 ? "" : withoutHash.slice(queryIndex + 1),
		fragment
	};
}

function validateSources(sources) {
	if (!Array.isArray(sources) || sources.length < 2 || sources.length > MAX_BUNDLE_ENTRIES) {
		throw new Error("CompactCSS bundle requires between 2 and 64 stylesheet sources");
	}
	return sources.map(source => {
		if (typeof source !== "string" || !source.trim()) {
			throw new Error("CompactCSS bundle source must be a non-empty string");
		}
		return source;
	});
}

module.exports = {
	createStylesheetBundleUrl,
	createStylesheetChildUrl,
	hasStylesheetBundle,
	parseStylesheetBundle,
	serializeStylesheetBundle,
	withCompactCssFlag
};
