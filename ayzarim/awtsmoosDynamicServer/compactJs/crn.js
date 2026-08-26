//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");

/**
 * @file Defines the Canonical Resource Name vocabulary shared by CompactJS resolution and browser request emission.
 * @description The Awtsmoos lets path, query, fragment, and resource kind emerge as separate rays from one authored name of light;
 * Awtsmoos.com keeps identity distinct from request decoration so one module stays one vessel while compact representation remains right.
 */
const DATA_LIKE_SCHEMES = new Set([
	"blob",
	"data",
	"javascript"
]);

/** Parses one authored specifier without decoding or destroying its query and fragment spelling. */
function parseCrn(source, options = {}) {
	const raw = String(source || "").trim();
	const parts = splitDecorations(raw);
	const kind = classifyPathname(parts.pathname);
	const externalPrefix = matchesExternalPrefix(
		parts.pathname,
		options.publicExternalPrefixes || []
	);
	const local = !externalPrefix
		&& (kind === "relative" || kind === "public-root");
	return Object.freeze({
		external: !local,
		hash: parts.hash,
		kind,
		local,
		pathname: parts.pathname,
		query: parts.query,
		raw
	});
}

/** Splits decorations in browser order: pathname, then query, then fragment. */
function splitDecorations(source) {
	const hashIndex = source.indexOf("#");
	const beforeHash = hashIndex >= 0
		? source.slice(0, hashIndex)
		: source;
	const hash = hashIndex >= 0
		? source.slice(hashIndex + 1)
		: "";
	const queryIndex = beforeHash.indexOf("?");
	return {
		hash,
		pathname: queryIndex >= 0
			? beforeHash.slice(0, queryIndex)
			: beforeHash,
		query: queryIndex >= 0
			? beforeHash.slice(queryIndex + 1)
			: ""
	};
}

/** Classifies browser module reference families before any filesystem resolution occurs. */
function classifyPathname(pathname) {
	if (pathname.startsWith("//")) {
		return "protocol-relative";
	}
	if (pathname.startsWith("./") || pathname.startsWith("../")) {
		return "relative";
	}
	if (pathname.startsWith("/")) {
		return "public-root";
	}
	const scheme = pathname.match(/^([A-Za-z][A-Za-z\d+.-]*):/);
	if (scheme) {
		return DATA_LIKE_SCHEMES.has(scheme[1].toLowerCase())
			? "data-like"
			: "external-url";
	}
	return "bare";
}

/** Reconstructs one CRN without changing the spelling of unrelated query or fragment data. */
function crnSpecifier(crn) {
	return `${crn.pathname}${crn.query ? `?${crn.query}` : ""}${crn.hash ? `#${crn.hash}` : ""}`;
}

/** Adds exactly one compact=true query entry while preserving every other raw query segment and the fragment. */
function withCompactFlag(source, options = {}) {
	const crn = typeof source === "string"
		? parseCrn(source, options)
		: source;
	if (!crn || !crn.local || !isJavaScriptPath(crn.pathname)) {
		return crn ? crnSpecifier(crn) : String(source || "");
	}
	const kept = String(crn.query || "")
		.split("&")
		.filter(Boolean)
		.filter((segment) => queryKey(segment) !== "compact");
	kept.push("compact=true");
	return crnSpecifier({
		...crn,
		query: kept.join("&")
	});
}

/** Treats extensionless local module references as JavaScript because CompactJS already infers `.js`. */
function isJavaScriptPath(pathname) {
	const extension = path.posix.extname(String(pathname || "").replace(/\\/g, "/"));
	return extension === "" || extension.toLowerCase() === ".js";
}

function matchesExternalPrefix(pathname, prefixes) {
	return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function queryKey(segment) {
	const rawKey = segment.split("=", 1)[0];
	try {
		return decodeURIComponent(rawKey.replace(/\+/g, " ")).toLowerCase();
	} catch {
		return rawKey.toLowerCase();
	}
}

module.exports = {
	classifyPathname,
	crnSpecifier,
	isJavaScriptPath,
	parseCrn,
	splitDecorations,
	withCompactFlag
};
