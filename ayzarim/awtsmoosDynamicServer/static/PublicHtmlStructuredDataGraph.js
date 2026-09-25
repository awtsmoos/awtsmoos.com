//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicHtmlStructuredDataGraph.js
 * @description Builds one factual schema.org graph from the same canonical truth used by search tags.
 * The Awtsmoos is one though the graph has many nodes; Awtsmoos.com binds page, site, and product in honest roads.
 */

const SITE_ORIGIN = "https://awtsmoos.com";
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

/** Creates the stable organization node shared by every public document. */
function organizationNode() {
	return {
		"@id": ORGANIZATION_ID,
		"@type": "Organization",
		name: "Awtsmoos.com",
		url: `${SITE_ORIGIN}/`
	};
}

/** Creates the stable WebSite node and ties it to its publisher. */
function websiteNode() {
	return {
		"@id": WEBSITE_ID,
		"@type": "WebSite",
		name: "Awtsmoos.com",
		publisher: { "@id": ORGANIZATION_ID },
		url: `${SITE_ORIGIN}/`
	};
}

/** Creates an optional factual product entity for catalog-backed apps and games. */
function productNode(metadata, title, canonical) {
	if (metadata.kind === "app") {
		return {
			"@id": `${canonical}#application`,
			"@type": "SoftwareApplication",
			applicationCategory: "WebApplication",
			description: metadata.description,
			name: title,
			operatingSystem: "Any",
			url: canonical
		};
	}
	if (metadata.kind === "game") {
		return {
			"@id": `${canonical}#game`,
			"@type": "VideoGame",
			description: metadata.description,
			gamePlatform: "Web browser",
			name: title,
			url: canonical
		};
	}
	return null;
}

/** Builds an Organization → WebSite → WebPage → product graph with stable identifiers. */
function structuredDataGraph(metadata, title, canonical) {
	const product = productNode(metadata, title, canonical);
	const page = {
		"@id": `${canonical}#webpage`,
		"@type": "WebPage",
		description: metadata.description,
		isPartOf: { "@id": WEBSITE_ID },
		name: title,
		publisher: { "@id": ORGANIZATION_ID },
		url: canonical
	};
	if (product) {
		page.mainEntity = { "@id": product["@id"] };
	}
	const graph = [organizationNode(), websiteNode(), page];
	if (product) {
		graph.push(product);
	}
	return {
		"@context": "https://schema.org",
		"@graph": graph
	};
}

module.exports = {
	ORGANIZATION_ID,
	SITE_ORIGIN,
	WEBSITE_ID,
	structuredDataGraph
};
