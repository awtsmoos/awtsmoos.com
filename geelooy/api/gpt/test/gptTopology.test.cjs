//B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { createGptHandlers } = require("../core/handlers.js");
const { resolveTransportStrategy } = require("../core/transportStrategy.js");

/** Public Awtsmoos.com must name the visitor's bridge instead of false loopback. */
test("transport strategy separates public and co-located topology", () => {
	assert.equal(resolveTransportStrategy(info({}, {
		host: "awtsmoos.com",
		origin: "https://awtsmoos.com"
	})), "browser-extension");
	assert.equal(resolveTransportStrategy(info({}, {
		host: "127.0.0.1:8080",
		origin: "http://127.0.0.1:8080"
	})), "server-relay");
	assert.equal(resolveTransportStrategy(info({}, {
		host: "awtsmoos.com",
		origin: "https://awtsmoos.com"
	}), {
		AWTSMOOS_GPT_TRANSPORT_MODE: "server-relay"
	}), "server-relay");
});

/** Capability on a public host returns a browser descriptor without relay use. */
test("public capability does not call server loopback", async () => {
	let relayCalls = 0;
	const handlers = createGptHandlers({
		relayClient: { invoke: async () => { relayCalls += 1; } }
	});
	const result = await handlers.capability(info({}, {
		method: "GET",
		host: "awtsmoos.com",
		origin: "https://awtsmoos.com"
	}));

	assert.equal(result.status, 200);
	assert.equal(result.response.transport, "browser-extension");
	assert.equal(result.response.bridge.method, "directCapability");
	assert.equal(result.response.serverRelayAttempted, false);
	assert.equal(relayCalls, 0);
});

/** Public chat returns an explicit browser handoff and never echoes the prompt. */
test("public chat requires browser relay without invoking or echoing", async () => {
	let relayCalls = 0;
	const handlers = createGptHandlers({
		relayClient: { invoke: async () => { relayCalls += 1; } }
	});
	const result = await handlers.chat(info({ prompt: "private prompt" }, {
		host: "awtsmoos.com",
		origin: "https://awtsmoos.com"
	}));
	const serialized = JSON.stringify(result);

	assert.equal(result.status, 409);
	assert.equal(result.response.error.code, "GPT_BROWSER_RELAY_REQUIRED");
	assert.equal(result.response.bridge.method, "directChat");
	assert.equal(serialized.includes("private prompt"), false);
	assert.equal(relayCalls, 0);
});

/** GET cannot trigger chat even in a local topology. */
test("chat rejects GET before relay invocation", async () => {
	let relayCalls = 0;
	const handlers = createGptHandlers({
		relayClient: { invoke: async () => { relayCalls += 1; } }
	});
	const result = await handlers.chat(info({ prompt: "no get" }, {
		method: "GET"
	}));

	assert.equal(result.status, 405);
	assert.equal(result.response.error.code, "GPT_METHOD_NOT_ALLOWED");
	assert.deepEqual(result.response.error.allowedMethods, ["POST"]);
	assert.equal(relayCalls, 0);
});

function info(body, overrides = {}) {
	return {
		request: {
			method: overrides.method || "POST",
			user: { info: { userId: "awtsmoos-user" } },
			headers: {
				origin: overrides.origin || "http://127.0.0.1:8080",
				host: overrides.host || "127.0.0.1:8080"
			}
		},
		$_POST: body,
		$_GET: {}
	};
}
