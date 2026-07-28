//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../../..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");

/**
 * The Awtsmoos tests request-only truth as a source contract. Awtsmoos.com must
 * expose capability, default to strict refusal, and name every carrier fallback
 * without returning raw stacks, upstream ids, tokens, or old endpoint logic.
 */
test("browser sender names fallback and exposes strict capability", () => {
	const client = read("geelooy/ai/AwtsmoosGPTify.js");
	const relay = read("geelooy/ai/js/chatgpt/direct/directRelay.js");

	assert.match(client, /directMode = "page-authorized-fallback"/);
	assert.match(client, /getDirectCapability/);
	assert.match(relay, /mode = "strict-request-only"/);
	assert.match(relay, /\/direct-capability/);
	assert.doesNotMatch(client, /backend-api\/conversation/);
	assert.doesNotMatch(client, /proofToken|chatRequirementsToken|accessToken/);
});

test("split relay exposes capability and safe enforcement refusal", () => {
	const server = read("geelooy/ai/relay/split-browser/server.cjs");
	const api = read("geelooy/ai/relay/split-browser/directApi.cjs");
	const service = read("geelooy/ai/relay/direct/chatgpt/DirectService.mjs");

	assert.match(server, /handleDirectApi/);
	assert.match(api, /\/direct-capability/);
	assert.match(api, /direct_enforcement_required/);
	assert.match(service, /mode = "strict-request-only"/);
	assert.match(service, /page-authorized-fallback/);
	assert.doesNotMatch(`${server}\n${api}`, /error\?\.stack|detail:\s*error/);
});

test("request-only capability uses settings host and public Sentinel SDK", () => {
	const service = read(
		"geelooy/ai/relay/direct/chatgpt/RequestOnlyCapabilityService.mjs"
	);
	const descriptor = read(
		"geelooy/ai/relay/direct/chatgpt/RequestOnlyCapabilityDescriptor.mjs"
	);
	const capability = `${service}\n${descriptor}`;
	const host = read(
		"geelooy/ai/relay/direct/browser/RequestOnlyHostController.mjs"
	);
	const sdk = read(
		"geelooy/ai/relay/direct/chatgpt/RequestOnlySentinelSdkClient.mjs"
	);

	assert.match(host, /route = "\/settings"/);
	assert.match(descriptor, /conversationPostSent: false/);
	assert.match(descriptor, /socketRequired: false/);
	assert.match(descriptor, /enforcementRequired/);
	assert.match(sdk, /SentinelSDK\.token/);
	assert.doesNotMatch(capability, /CarrierPromptInteractor|FetchEnvelopeInterceptor/);
	assert.doesNotMatch(host, /Page\.addScriptToEvaluateOnNewDocument|WebSocket/);
});

test("extension exposes direct capability and explicit chat payloads", () => {
	const manifest = JSON.parse(read(
		"geelooy/scripts/tricks/extensions/server/manifest.json"
	));
	const assets = read("geelooy/ai/promptAssets.js");
	const background = read(
		"geelooy/scripts/tricks/extensions/server/backgroundHandlers.js"
	);
	const injected = read("geelooy/scripts/tricks/extensions/server/jected.js");
	const resources = manifest.web_accessible_resources.flatMap(entry => entry.resources);

	for (const name of ["jected.js", "jectedBridge.js", "jectedResponse.js"]) {
		assert.ok(resources.includes(name));
		assert.match(assets, new RegExp(name.replace(".", "\\.")));
	}
	assert.match(background, /direct-capability/);
	assert.match(injected, /awtsFetch\.directCapability/);
	assert.match(injected, /awtsFetch\.directChat/);
	assert.doesNotMatch(`${background}\n${injected}`, /error\?\.stack|\.stack\s*[,}]/);
});

test("direct relay keeps upstream ids behind opaque local keys", () => {
	const service = read("geelooy/ai/relay/direct/chatgpt/DirectService.mjs");
	const store = read("geelooy/ai/relay/direct/chatgpt/ConversationStore.mjs");

	assert.match(store, /BH_DIRECT_/);
	assert.match(service, /conversationKey/);
	assert.doesNotMatch(service, /return\s*\{[^}]*conversationId/s);
	assert.doesNotMatch(service, /parentMessageId\s*:/);
});
