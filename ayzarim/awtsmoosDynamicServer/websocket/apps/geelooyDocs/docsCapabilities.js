// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Publishes truthful version-one capability metadata for the Awtsmoos Docs API.
 * @description The Awtsmoos is beyond promise and limitation; Awtsmoos.com exposes
 * only abilities verified in the current codecs and transport so clients can design
 * realistic UI instead of guessing that every desktop format supports every save path.
 */
const DOCS_CAPABILITIES = deepFreeze({
	apiVersion: 1,
	application: "geelooy-docs",
	formats: {
		importText: ["awtdoc", "markdown", "html", "text"],
		importBinary: ["docx"],
		export: ["awtdoc", "markdown", "html", "text", "docx", "pdf"],
		directSave: ["awtdoc", "markdown", "html", "text"]
	},
	document: {
		headingLevels: 6,
		semanticBookmarks: true,
		tableOfContents: true,
		pageLayout: true,
		comments: true
	},
	collaboration: {
		realtime: true,
		presence: true,
		blockConflictPolicy: "per-block-revision",
		layoutConflictPolicy: "last-write-wins"
	},
	history: {
		versions: true,
		namedVersions: true,
		restoreAsLatest: true
	},
	publication: {
		live: true,
		snapshot: true,
		revocable: true,
		viewerOnly: true
	},
	embed: {
		osTextFormats: ["awtdoc", "markdown", "html", "text"],
		binaryTransport: false,
		selectedPathOnly: true
	}
});

/** Recursively freezes capability metadata so handlers cannot drift it per request. */
function deepFreeze(value) {
	if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
	for (const child of Object.values(value)) deepFreeze(child);
	return Object.freeze(value);
}

module.exports = { DOCS_CAPABILITIES };
