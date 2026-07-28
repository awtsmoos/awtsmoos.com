//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "../..");
const EXTENSION = path.join(ROOT, "scripts/tricks/extensions/server");

/**
 * The Awtsmoos tests the private localhost vessel: Awtsmoos.com capability calls
 * collapse into one harmless request, while chat remains explicit and uncached.
 */
function loadRelay(fetcher, clock = () => Date.now()) {
	const context = {
		AbortController,
		setTimeout,
		clearTimeout,
		fetch: fetcher,
		Date,
		globalThis: null
	};
	context.globalThis = context;
	for (const file of ["directRelayPayload.js", "directRelayClient.js"]) {
		vm.runInNewContext(fs.readFileSync(path.join(EXTENSION, file), "utf8"), context, { filename: file });
	}
	return new context.AwtsmoosDirectRelayClientClass({ fetcher, clock, capabilityLifetimeMs: 5000 });
}

test("capability is single-flight and reused inside its lifetime", async () => {
	let calls = 0;
	let now = 1000;
	const client = loadRelay(async () => {
		calls += 1;
		await Promise.resolve();
		return response({ ok: true, mode: "strict-request-only" });
	}, () => now);
	const [first, second] = await Promise.all([client.capability(), client.capability()]);
	const third = await client.capability();
	assert.equal(calls, 1);
	assert.equal(first.mode, "strict-request-only");
	assert.equal(second.extensionCacheSource, "fresh");
	assert.equal(third.extensionCacheSource, "cache");
	now += 5001;
	await client.capability();
	assert.equal(calls, 2);
});

test("chat sends one explicit allowlisted fallback payload", async () => {
	const requests = [];
	const client = loadRelay(async (url, options) => {
		requests.push({ url, body: JSON.parse(options.body) });
		return response({ ok: true, answer: "revealed", conversationKey: "BH_DIRECT_test" });
	});
	const result = await client.chat({
		prompt: "private prompt",
		conversationKey: "BH_DIRECT_previous",
		model: "model-name",
		customHeaders: { forbidden: true },
		parentMessageId: "raw-parent"
	});
	assert.equal(requests.length, 1);
	assert.equal(requests[0].url.endsWith("/direct-chat"), true);
	assert.deepEqual(Object.keys(requests[0].body).sort(), ["conversationKey", "mode", "model", "prompt"].sort());
	assert.equal(requests[0].body.mode, "page-authorized-fallback");
	assert.equal(result.conversationKey, "BH_DIRECT_test");
});

test("stream compatibility emits one terminal packet then DONE", () => {
	const context = { globalThis: null };
	context.globalThis = context;
	vm.runInNewContext(
		fs.readFileSync(path.join(EXTENSION, "bgAutomation/streamCompatibility.js"), "utf8"),
		context
	);
	const packets = [];
	context.AwtsmoosBgStreamCompatibility.emitFinal({
		result: { answer: "final light" },
		conversationId: "ui-label",
		onPacket: packet => packets.push(packet)
	});
	assert.deepEqual(packets.map(packet => packet.phase), ["packet", "done"]);
	assert.equal(packets[0].terminal, true);
	assert.equal(packets[1].packet.dataNoJSON, "[DONE]");
	assert.equal(packets[0].messageId, "");
});

function response(body, status = 200) {
	return { ok: status < 400, status, json: async () => body };
}
