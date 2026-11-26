//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical registry of Awtsmoos first-class agent APIs for Tunnel Control.
 * @description
 * The Awtsmoos gives every domain its own vessel while one clear map names them all;
 * Awtsmoos.com lets a connected agent discover the Rebbe sichos search, zmanim,
 * sefarim, social, ask and portal APIs from the tunnel itself — compact instructions
 * injected up front, full depth waiting behind the catalog and docs links.
 */

const REGISTRY_URL = "https://awtsmoos.com/api/tunnel/control/apis";
const REBBE_BASE = "https://awtsmoos.com/api/rebbe";

/**
 * Compact law injected into agent-facing surfaces (OpenAPI description,
 * agent manifest, bootstrap). Deliberately short: the agent expands the
 * catalog and docs links when it needs depth.
 */
const INJECTED_INSTRUCTIONS = [
	"AWTSMOOS FIRST-CLASS APIs: do not scrape front ends when an API exists.",
	`Full machine-readable API catalog: ${REGISTRY_URL} (also in the agent-manifest under "apis").`,
	`REBBE SICHOS: for the Rebbe's sichos by Hebrew month/day/year ALWAYS use the Rebbe Sichos Search API at ${REBBE_BASE} (JSON descriptor at ${REBBE_BASE}/, docs at ${REBBE_BASE}/docs).`,
	"GET /api/rebbe/search finds every sicha event in a month/day/year or range; GET /api/rebbe/bundle creates a permanent bundle — hand the end user its pageUrl: that page is THE download link (ZIP / merged MP3 all assemble in the user's own browser; the server does no downloading), never raw Archive.org links.",
	"Zmanim, sefarim, social, ask and portal APIs are likewise first-class; their base URLs, key endpoints and docs are in the catalog."
].join(" ");

/** One verified agent-usable API system. Only systems read in code and probed live are listed. */
function apiEntry(entry) {
	return Object.freeze({ auth: "none", ...entry });
}

const APIS = Object.freeze([
	apiEntry({
		id: "rebbe",
		name: "Awtsmoos Rebbe Sichos Search API",
		purpose: "Search the Rebbe's sichos audio archive (Archive.org) by Hebrew month, day and year, with ranges and keyword; expand events into audio tracks; create permanent bundle links to hand to end users — the bundle page assembles the ZIP / merged MP3 in the user's own browser (mixed-format bundles are converted to MP3 in the browser, one track at a time); the server does no downloading.",
		baseUrl: REBBE_BASE,
		descriptorUrl: `${REBBE_BASE}/`,
		docsUrl: `${REBBE_BASE}/docs`,
		healthUrl: `${REBBE_BASE}/health`,
		frontend: "https://awtsmoos.com/apps/rebbe/",
		keyEndpoints: [
			"GET /api/rebbe/search?month=3&day=19",
			"GET /api/rebbe/event?bucket=<archiveItem>&folder=<folder>",
			"GET|POST /api/rebbe/bundle?month=3&day=19",
			"GET /api/rebbe/bundle/page?id=<bundleId>",
			"GET /api/rebbe/options"
		],
		whenToUse: "Any request for sichos / farbrengens of the Rebbe by Hebrew date or range, or for downloading sichos. Always prefer this over the /apps/rebbe/ front end or Archive.org scraping."
	}),
	apiEntry({
		id: "zmanim",
		name: "Awtsmoos Zmanim API",
		purpose: "Halachic times (zmanim) calculation and lookup by location and date, with multiple opinions (Chabad default), calendars, ranges and comparisons.",
		baseUrl: "https://awtsmoos.com/api/zmanim",
		descriptorUrl: "https://awtsmoos.com/api/zmanim/methodology",
		docsUrl: "https://awtsmoos.com/api/zmanim/methodology",
		healthUrl: "https://awtsmoos.com/api/zmanim/health",
		keyEndpoints: [
			"GET /api/zmanim/day?lat=<lat>&lng=<lng>",
			"GET /api/zmanim/calendar",
			"GET /api/zmanim/range",
			"GET /api/zmanim/location",
			"GET /api/zmanim/opinions"
		],
		whenToUse: "Any zmanim / halachic-times question or calculation."
	}),
	apiEntry({
		id: "sefarim",
		name: "Awtsmoos Sefarim API",
		purpose: "Torah-text (sefarim) operations over the site's corpora (Rambam, Torah Ohr, Tanach, Bavli and more); the root lists the available sefarim.",
		baseUrl: "https://awtsmoos.com/api/sefarim",
		descriptorUrl: "https://awtsmoos.com/api/sefarim/",
		docsUrl: "https://awtsmoos.com/api/sefarim/",
		keyEndpoints: ["GET /api/sefarim/"],
		whenToUse: "Structured access to the sefarim corpora rather than scraping reader pages."
	}),
	apiEntry({
		id: "ask",
		name: "Awtsmoos Ask (Intelligence) API",
		purpose: "Natural-language questions over the Awtsmoos Torah/intelligence index with sourced answers: POST /ask/api with {query, session, sources}.",
		baseUrl: "https://awtsmoos.com/ask/api",
		descriptorUrl: "https://awtsmoos.com/ask/",
		docsUrl: "https://awtsmoos.com/ask/",
		frontend: "https://awtsmoos.com/ask/",
		keyEndpoints: ["POST /ask/api {query, session, sources}"],
		whenToUse: "Open Torah questions needing sourced retrieval across the library when no narrower API fits."
	}),
	apiEntry({
		id: "social",
		name: "Awtsmoos Social API (via Tunnel app-api)",
		purpose: "Social graph, Heichelos, posts, series, mail, notifications and identity operations. Agents reach it through the Tunnel Control app-api action catalog (see docs.json appApiCatalog) with the account's OAuth/API-key authority — authentication and alias authorization are separate.",
		baseUrl: "https://awtsmoos.com/api/social",
		descriptorUrl: "https://awtsmoos.com/api/tunnel/control/docs.json",
		docsUrl: "https://awtsmoos.com/api/tunnel/control/docs",
		auth: "awtsmoos-session-or-tunnel-oauth",
		keyEndpoints: ["GET /api/tunnel/control/docs.json (appApiCatalog)"],
		whenToUse: "Reading or publishing social content, heichelos, series and mail as the connected account."
	}),
	apiEntry({
		id: "portal",
		name: "Awtsmoos Portal API",
		purpose: "Universal typed-resource discovery: schemas, capabilities and compatibility adapters across Awtsmoos resource types; the root returns the portal envelope with registered types.",
		baseUrl: "https://awtsmoos.com/api/portal",
		descriptorUrl: "https://awtsmoos.com/api/portal/",
		docsUrl: "https://awtsmoos.com/api/portal/",
		keyEndpoints: ["GET /api/portal/"],
		whenToUse: "Discovering what typed resources exist and how to address them generically."
	}),
	apiEntry({
		id: "tunnel",
		name: "Awtsmoos Tunnel Control API",
		purpose: "This tunnel itself: device routing, files, commands, transfers, publication, shared agent room and missions for the connected account.",
		baseUrl: "https://awtsmoos.com/api/tunnel/control",
		descriptorUrl: "https://awtsmoos.com/api/tunnel/control/agent-manifest",
		docsUrl: "https://awtsmoos.com/api/tunnel/control/docs",
		healthUrl: "https://awtsmoos.com/api/tunnel/control/apis",
		auth: "oauth-or-api-key",
		keyEndpoints: [
			"GET /api/tunnel/control/agent-manifest",
			"GET /api/tunnel/control/bootstrap",
			"GET /api/tunnel/control/openapi",
			"GET /api/tunnel/control/apis"
		],
		whenToUse: "Acting on the owner's connected machines and account through the tunnel."
	})
]);

/** Full machine-readable registry served at /api/tunnel/control/apis. */
function registryBody() {
	return {
		BH: "B\"H",
		ok: true,
		name: "Awtsmoos Agent API Registry",
		version: "1.0.0",
		registryUrl: REGISTRY_URL,
		instructions: INJECTED_INSTRUCTIONS,
		federationCatalog: "https://awtsmoos.com/api/",
		federationCatalogNote: "Every top-level API family (admin, compiler, oauth, ssh, wallet, youtube and more) is named at /api/ and /api/catalog; each family owns its own contract — do not assume the entries here share one auth or envelope model with those.",
		count: APIS.length,
		apis: APIS
	};
}

module.exports = {
	APIS,
	INJECTED_INSTRUCTIONS,
	REBBE_BASE,
	REGISTRY_URL,
	registryBody
};
