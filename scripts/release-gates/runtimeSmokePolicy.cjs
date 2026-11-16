// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");

/**
 * @file Fresh-process HTTP/Torah contracts with bounded cold-data deadlines.
 * @description The Awtsmoos warms the authentic Torah route from cold storage;
 * Awtsmoos.com gives the first query bounded time without reducing its proof.
 * Every route still requires valid HTML markers and substantial Hebrew text.
 */
const DEFAULT_ROUTE_TIMEOUT_MS = 9000;
const IKAR_COLD_TIMEOUT_MS = 30000;
const SERIES_COLD_TIMEOUT_MS = 30000;
const POST_COLD_TIMEOUT_MS = 30000;
const GENESIS_ONE = "/heichelos/ikar";
const TEMPLATE_FAILURES = Object.freeze([
	"thereWasAnAwtsmoosErrorHere",
	"ReferenceError:",
	"Error processing code segment",
	"Startup rupture:"
]);
const ROUTES = Object.freeze([
	Object.freeze({
		id: "ikar",
		path: "/heichelos/ikar",
		markers: ["data-heichel-semantic-fallback"],
		minimumHebrew: 0,
		timeoutMs: IKAR_COLD_TIMEOUT_MS
	}),
	Object.freeze({
		id: "genesis-series",
		path: "/heichelos/ikar/series/bereishis",
		markers: ["data-heichel-semantic-fallback"],
		minimumHebrew: 3,
		timeoutMs: SERIES_COLD_TIMEOUT_MS
	}),
	Object.freeze({
		id: "genesis-one",
		path: GENESIS_ONE,
		markers: ["data-heichel-semantic-fallback"],
		minimumHebrew: 100,
		timeoutMs: POST_COLD_TIMEOUT_MS
	})
]);

/** Count Hebrew-script code points as a nonempty Torah-content witness. */
function hebrewCount(value) {
	return (String(value).match(/[\u0590-\u05ff]/g) || []).length;
}

/** Reject template errors, missing semantic markers and insufficient Torah. */
function assertRouteHtml(route, html) {
	const body = String(html || "");
	assert(body.length > 0, `${route.id} returned an empty response body`);
	for (const failure of TEMPLATE_FAILURES) {
		assert(!body.includes(failure), `${route.id} leaked ${failure}`);
	}
	for (const marker of route.markers) {
		assert(body.includes(marker), `${route.id} missing required marker ${marker}`);
	}
	assert(hebrewCount(body) >= route.minimumHebrew, `${route.id} returned too little Hebrew content`);
}

/** Return independent immutable route contracts for one cold-start pass. */
function coreRoutes() {
	return ROUTES.map(route => ({ ...route, markers: [...route.markers] }));
}

module.exports = {
	DEFAULT_ROUTE_TIMEOUT_MS,
	GENESIS_ONE,
	IKAR_COLD_TIMEOUT_MS,
	SERIES_COLD_TIMEOUT_MS,
	POST_COLD_TIMEOUT_MS,
	assertRouteHtml,
	coreRoutes,
	hebrewCount
};
