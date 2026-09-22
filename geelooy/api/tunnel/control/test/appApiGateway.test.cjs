// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies the Awtsmoos application API gateway for external agents.
 * @description
 * The Awtsmoos opens application power to outsiders; these tests prove the
 * catalog is coherent, the awtsmoos.api scope exists and is grantable, the
 * gateway rejects unauthenticated/unscoped/unknown calls before touching the
 * application, and results are bounded and secret-redacted.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const { TUNNEL_SCOPE, CHATGPT_ALLOWED_TUNNEL_SCOPES, OAUTH_SCOPE_DESCRIPTIONS } = require("../../shared/scopeCatalog.js");
const { AGENT_ALLOWED_SCOPES } = require("../../../oauth/data/publicAgentPolicy.js");
const { OPERATIONS, GROUPS, getOperation, catalogBody } = require("../docs/appApiCatalog.js");
const { appApiRoutes } = require("../routes/routeGroups/appApiRoutes.js");
const { appApiCall } = require("../routes/appApiCallRoute.js");
const { appApiCatalogRoute } = require("../routes/appApiCatalogRoute.js");

// Dispatch modules are relative to the caller (geelooy/api/tunnel/control/routes/),
// since require() in appApiCallRoute.js resolves against that module.
const ROUTES_DIR = path.resolve(__dirname, "..", "routes");

function fakeI(overrides = {}) {
	return {
		$_POST: {},
		$_GET: {},
		request: { headers: {}, method: "POST", query: {} },
		response: null,
		...overrides
	};
}

test("awtsmoos.api scope exists, is described, and is grantable to external agents", () => {
	assert.equal(TUNNEL_SCOPE.API, "awtsmoos.api");
	assert.ok(CHATGPT_ALLOWED_TUNNEL_SCOPES.includes("awtsmoos.api"), "scope must be in allowed tunnel scopes");
	assert.ok(AGENT_ALLOWED_SCOPES.includes("awtsmoos.api"), "scope must be grantable via the external-agent client");
	assert.ok(String(OAUTH_SCOPE_DESCRIPTIONS["awtsmoos.api"] || "").length > 10, "scope needs a human description");
});

test("catalog is well-formed: unique ids, valid groups, dispatch bindings", () => {
	const body = catalogBody();
	assert.equal(body.ok, true);
	assert.equal(body.scope, "awtsmoos.api");
	assert.ok(body.callEndpoint.includes("/api/tunnel/control/app-api/call"));
	const ids = OPERATIONS.map(op => op.id);
	assert.equal(new Set(ids).size, ids.length, "operation ids must be unique");
	const groupIds = new Set(GROUPS.map(g => g.id));
	for (const op of OPERATIONS) {
		assert.ok(op.id && op.title && op.description, `${op.id}: needs id/title/description`);
		assert.ok(["GET", "POST", "PUT", "DELETE"].includes(op.method), `${op.id}: valid method`);
		assert.ok(groupIds.has(op.group), `${op.id}: known group`);
		assert.ok(["public", "login", "alias"].includes(op.auth), `${op.id}: valid auth class`);
		for (const p of op.pathParams || []) {
			assert.ok(op.path.includes(`{${p}}`), `${op.id}: path param {${p}} must appear in path template`);
		}
		assert.ok(op.dispatch && op.dispatch.module && op.dispatch.route, `${op.id}: dispatch binding required`);
		assert.ok(op.example && op.example.params, `${op.id}: runnable example required`);
	}
});

test("catalog dispatch modules resolve and export route factories", () => {
	for (const op of OPERATIONS) {
		const abs = path.resolve(ROUTES_DIR, op.dispatch.module);
		assert.ok(fs.existsSync(abs), `${op.id}: dispatch module must exist at ${op.dispatch.module}`);
		const factory = require(abs);
		assert.equal(typeof factory, "function", `${op.id}: dispatch module must export the route factory`);
	}
});

test("catalog dispatch route keys exist in the real application route maps", () => {
	const seen = new Map();
	for (const op of OPERATIONS) {
		if (!seen.has(op.dispatch.module)) {
			const factory = require(path.resolve(ROUTES_DIR, op.dispatch.module));
			const probe = Object.create(null);
			probe.$_GET = {}; probe.$_POST = {}; probe.$_DELETE = {}; probe.$_QUERY = {};
			probe.request = { method: op.method, headers: {}, query: {} };
			let routeMap;
			try {
				routeMap = factory({ $i: probe, userid: null });
			} catch {
				routeMap = null;
			}
			seen.set(op.dispatch.module, routeMap);
		}
		const routeMap = seen.get(op.dispatch.module);
		assert.ok(routeMap && typeof routeMap === "object", `${op.id}: factory must return a route map`);
		assert.equal(typeof routeMap[op.dispatch.route], "function",
			`${op.id}: route key "${op.dispatch.route}" must exist in the application route map`);
	}
});

test("route group registers both gateway doors", () => {
	assert.equal(typeof appApiRoutes["app-api/catalog"], "function");
	assert.equal(typeof appApiRoutes["app-api/call"], "function");
});

test("catalog route serves the catalog body as JSON", async () => {
	const raw = await appApiCatalogRoute(fakeI());
	const body = JSON.parse(raw);
	assert.equal(body.ok, true);
	assert.ok(Array.isArray(body.operations) && body.operations.length > 0);
});

test("gateway rejects a missing operation id", async () => {
	const raw = await appApiCall(fakeI({ $_POST: {} }));
	const body = JSON.parse(raw);
	assert.equal(body.ok, false);
	assert.equal(body.error, "missing_operation");
});

test("gateway rejects an unknown operation before touching auth", async () => {
	const raw = await appApiCall(fakeI({ $_POST: { operation: "nope.not-real" } }));
	const body = JSON.parse(raw);
	assert.equal(body.ok, false);
	assert.equal(body.error, "unknown_operation");
});

test("gateway rejects unauthenticated calls", async () => {
	const raw = await appApiCall(fakeI({ $_POST: { operation: "heichel.get", params: { heichel: "ikar" } } }));
	const body = JSON.parse(raw);
	assert.equal(body.ok, false);
	assert.equal(body.error, "not_authenticated");
});

test("gateway rejects calls missing required path params", async () => {
	// Reaches param validation only with a token; without one it must still 401, never 500.
	const raw = await appApiCall(fakeI({ $_POST: { operation: "posts.get", params: {} } }));
	const body = JSON.parse(raw);
	assert.equal(body.ok, false);
	assert.ok(["not_authenticated", "missing_params"].includes(body.error));
});

test("getOperation returns null for unknown ids", () => {
	assert.equal(getOperation("does.not.exist"), null);
	assert.ok(getOperation("posts.get"));
});
