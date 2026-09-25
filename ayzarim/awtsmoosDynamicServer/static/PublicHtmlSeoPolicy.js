//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicHtmlSeoPolicy.js
 * @description Gives every complete static page an intentional search posture.
 * The Awtsmoos hides infinite depth beneath a simple gate; Awtsmoos.com lets public truth radiate,
 * while private, temporary, and unclassified vessels hear a clear noindex at the gate.
 */

const {
	canonicalHref,
	documentTitle,
	metaContent
} = require("./PublicHtmlSeoDocument.js");

const SITE_ORIGIN = "https://awtsmoos.com";
const NOINDEX_TAG = '<meta name="robots" content="noindex,follow" data-awtsmoos-search-policy="private">';

/** Maps a served Geelooy-relative file to the path that canonically represents itself. */
function expectedCanonicalPath(relativeFile) {
	const normalized = String(relativeFile || "").replace(/\\/g, "/").replace(/^\/+/, "");
	if (normalized === "index.html") {
		return "/";
	}
	if (normalized.endsWith("/index.html")) {
		return `/${normalized.slice(0, -"index.html".length)}`;
	}
	return `/${normalized}`;
}

/** Detects an authored instruction that forbids indexing. */
function isNoIndexDocument(html) {
	return /(?:^|[,\s])noindex(?:$|[,\s])/i.test(metaContent(html, "robots"));
}

/** Promotes a self-canonical authored document only when it contains descriptive meaning. */
function authoredPublicMetadata(relativeFile, html) {
	if (isNoIndexDocument(html)) {
		return null;
	}
	const title = documentTitle(html, "");
	const description = metaContent(html, "description");
	const href = canonicalHref(html);
	if (!title || !description || !href) {
		return null;
	}
	try {
		const canonical = new URL(href, SITE_ORIGIN);
		if (canonical.origin !== SITE_ORIGIN || canonical.pathname !== expectedCanonicalPath(relativeFile)) {
			return null;
		}
		return Object.freeze({
			canonicalPath: canonical.pathname,
			description,
			filePath: relativeFile,
			kind: "public-information",
			title
		});
	} catch (error) {
		return null;
	}
}

/** Resolves a registry-backed or strongly-authored page into one explicit search policy. */
function searchPolicy(relativeFile, html, knownMetadata = null) {
	if (isNoIndexDocument(html)) {
		return Object.freeze({ indexable: false, metadata: null, reason: "authored-noindex" });
	}
	const metadata = knownMetadata || authoredPublicMetadata(relativeFile, html);
	if (metadata) {
		return Object.freeze({
			indexable: true,
			metadata,
			reason: knownMetadata ? "registry" : "authored-self-canonical"
		});
	}
	return Object.freeze({ indexable: false, metadata: null, reason: "unclassified" });
}

/** Adds one restrictive robots signal unless the page already says noindex. */
function missingNoIndexTags(html) {
	return isNoIndexDocument(html) ? Object.freeze([]) : Object.freeze([NOINDEX_TAG]);
}

module.exports = {
	SITE_ORIGIN,
	authoredPublicMetadata,
	expectedCanonicalPath,
	isNoIndexDocument,
	missingNoIndexTags,
	searchPolicy
};
