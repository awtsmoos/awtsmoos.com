//B"H
//Boruch Hashem
//Blessed is He
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { actionContext, invokeRoute } = require("./actionContext.js");
const { tools } = require("./toolCatalog.js");
const Generic = require("./genericTools.js");
const Device = require("./deviceTools.js");
const { requiredScope } = require("../core/tunnelPayload/scope.js");
const { dispatch } = require("./protocol.js");

test("MCP retains old tools and declares mutation conservatively", () => {
	const names = tools.map(tool => tool.name);
	assert.equal(new Set(names).size, 9);
	for (const name of ["awtsmoos_read_file", "awtsmoos_list_directory",
		"awtsmoos_tunnel_action", "awtsmoos_application_call"]) {
		assert.ok(names.includes(name));
	}
	assert.equal(tools.find(t => t.name === "awtsmoos_tunnel_action")
		.annotations.destructiveHint, true);
});

test("child request isolates RPC envelope, query credentials and status", async () => {
	const original = {
		request: { headers: { authorization: "Bearer test" }, method: "POST" },
		$_GET: { apiKey: "must-not-forward", action: "delete" },
		paramKinds: { GET: { action: "delete" }, POST: { jsonrpc: "2.0" } },
		response: { statusCode: 200, setHeader() {} }
	};
	const child = actionContext(original, { action: "read" });
	assert.deepEqual(child.$_GET, {});
	assert.deepEqual(child.paramKinds.POST, { action: "read" });
	assert.equal(child.request.headers.authorization, "Bearer test");
	await assert.rejects(invokeRoute(original, {}, async context => {
		context.response.statusCode = 403;
		return JSON.stringify({ ok: false, error: "insufficient_scope" });
	}), error => error.data.error === "insufficient_scope");
	assert.equal(original.response.statusCode, 200);
	await assert.rejects(invokeRoute(original, {}, async () =>
		JSON.stringify({ ok: false, error: "not_authenticated" })));
});

test("generic payload refuses action, route and credential overrides", () => {
	for (const name of ["action", "tunnelName", "apiKey", "params64", "params"]) {
		assert.throws(() => Generic.tunnelPayload({
			action: "read", params: { [name]: "override" }
		}));
	}
	assert.throws(() => Generic.tunnelPayload({ action: "", params: {} }));
	assert.throws(() => Generic.tunnelPayload({ action: "write", params: [] }));
	const payload = Generic.tunnelPayload({
		action: "write", params: { p: "/exact", content: "שלום & ?", autoPreview: false }
	});
	assert.equal(payload.content, "שלום & ?");
	assert.equal(requiredScope(payload.action), "tunnel.write");
	assert.equal(requiredScope("commandRun"), "tunnel.command");
	assert.equal(requiredScope("chromeNavigate"), "tunnel.browser");
});

test("generic dispatch still passes through real authentication gate", async () => {
	const original = Device.discover;
	Device.discover = () => ({ routeReference: "test-exact-route" });
	try {
		await assert.rejects(Generic.tunnelAction({
			request: { headers: {}, user: null }, paramKinds: {}
		}, {}, { action: "write", params: { p: "/never-written", content: "test" } }),
		error => error.data.ok === false);
	} finally { Device.discover = original; }
});

test("application calls preserve actual scope denial and catalog", async () => {
	const result = await dispatch({}, {}, {
		method: "tools/call", params: { name: "awtsmoos_application_catalog" }
	});
	assert.ok(result.structuredContent.operationCount >= 12);
	await assert.rejects(Generic.applicationCall({
		request: { headers: {}, user: null }
	}, {}, { operation: "heichel.get", params: { heichel: "test" } }),
	error => error.data.error === "not_authenticated");
});
