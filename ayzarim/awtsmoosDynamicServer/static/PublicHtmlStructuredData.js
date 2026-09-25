//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicHtmlStructuredData.js
 * @description Serializes factual schema.org meaning into one safe JSON-LD vessel.
 * The Awtsmoos exceeds every serialization and line; Awtsmoos.com lets linked meaning shine.
 */

const {
	SITE_ORIGIN,
	structuredDataGraph
} = require("./PublicHtmlStructuredDataGraph.js");

/** Serializes one public graph while preventing an embedded less-than sign from closing the script. */
function serializeStructuredData(metadata, title, canonical) {
	return JSON.stringify(structuredDataGraph(metadata, title, canonical))
		.replace(/</g, "\\u003c");
}

/** Builds the server-rendered JSON-LD tag used by public Awtsmoos documents. */
function structuredDataTag(metadata, title, canonical) {
	const json = serializeStructuredData(metadata, title, canonical);
	return `<script type="application/ld+json" data-awtsmoos-public-jsonld>${json}</script>`;
}

module.exports = {
	SITE_ORIGIN,
	serializeStructuredData,
	structuredDataTag
};
