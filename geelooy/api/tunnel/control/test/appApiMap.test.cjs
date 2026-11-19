//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file appApiMap.test.cjs
 * @description
 * The Awtsmoos lets generated roads be tested without turning discovery into command;
 * Awtsmoos.com proves the map is bounded, searchable, and separate from the guarded hand.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { MalchusApiMapService, apiMapService } = require("../docs/apiMap/MalchusApiMapService.js");
const { appApiMapRoute } = require("../routes/appApiMapRoute.js");
const { appApiRoutes } = require("../routes/routeGroups/appApiRoutes.js");

function fakeRequest(query = {}) {
	return {
		$_GET: query,
		$_QUERY: query,
		request: { headers: {}, method: "GET", query },
		response: null
	};
}

test("generated map loads bounded route evidence", () => {
	const result = apiMapService.read({ family: "/api/tunnel", limit: 3 });
	assert.equal(result.ok, true);
	assert.equal(result.evidenceOnly, true);
	assert.ok(result.generation.routeCount > 0);
	assert.ok(result.filteredCount >= result.routes.length);
	assert.ok(result.routes.length <= 3);
	assert.ok(result.routes.every(route => route.family === "/api/tunnel"));
	assert.match(result.warning, /not proof/i);
});

test("query normalization caps page size and paginates deterministically", () => {
	const first = apiMapService.read({ q: "api", limit: 999, offset: -7 });
	assert.equal(first.ok, true);
	assert.equal(first.query.limit, 100);
	assert.equal(first.query.offset, 0);
	assert.ok(first.routes.length <= 100);
	if (first.page.nextOffset !== null) {
		const second = apiMapService.read({
			q: "api",
			limit: first.query.limit,
			offset: first.page.nextOffset
		});
		assert.equal(second.page.offset, first.page.nextOffset);
		assert.notEqual(second.routes[0]?.id, first.routes[0]?.id);
	}
});

test("route group publishes the map without replacing guarded gateway doors", async () => {
	assert.equal(appApiRoutes["app-api/map"], appApiMapRoute);
	assert.equal(typeof appApiRoutes["app-api/catalog"], "function");
	assert.equal(typeof appApiRoutes["app-api/call"], "function");
	const raw = await appApiMapRoute(fakeRequest({ limit: 1 }));
	const body = JSON.parse(raw);
	assert.equal(body.ok, true);
	assert.equal(body.routes.length, 1);
});

test("incomplete generated evidence fails closed", () => {
	const generatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-api-map-"));
	try {
		fs.writeFileSync(
			path.join(generatedRoot, "MANIFEST.json"),
			JSON.stringify({
				schema: "awtsmoos-api-tutorial-discovery-v1",
				routeCount: 1,
				routeIndexChunks: ["routes-001.json"]
			})
		);
		const service = new MalchusApiMapService({ generatedRoot });
		const result = service.read({});
		assert.equal(result.ok, false);
		assert.equal(result.error, "map_unavailable");
	} finally {
		fs.rmSync(generatedRoot, { recursive: true, force: true });
	}
});
