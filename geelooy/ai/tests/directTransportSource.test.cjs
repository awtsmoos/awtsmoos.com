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
 * The Awtsmoos tests source boundaries as contracts: the browser app must use
 * opaque direct relay keys, the extension must expose the direct bridge, and no
 * touched route may return raw stacks or the obsolete conversation endpoint.
 */
test("browser sender uses opaque direct relay instead of the old endpoint", () => {
	const client = read("geelooy/ai/AwtsmoosGPTify.js");
	const relay = read("geelooy/ai/js/chatgpt/direct/directRelay.js");

	assert.match(client, /sendDirectChat/);
	assert.match(client, /BH_DIRECT_/);
	assert.doesNotMatch(client, /backend-api\/conversation/);
	assert.doesNotMatch(client, /proofToken|chatRequirementsToken|accessToken/);
	assert.match(relay, /\/direct-chat/);
});

test("split relay exposes safe direct routes without raw error details", () => {
	const server = read("geelooy/ai/relay/split-browser/server.cjs");
	const api = read("geelooy/ai/relay/split-browser/directApi.cjs");

	assert.match(server, /handleDirectApi/);
	assert.match(api, /\/direct-chat/);
	assert.match(api, /direct_authentication_required/);
	assert.doesNotMatch(server, /error\?\.stack|detail:\s*error/);
	assert.doesNotMatch(api, /error\?\.stack|stack:/);
});

test("extension package includes split direct bridge helpers", () => {
	const manifest = JSON.parse(read("geelooy/scripts/tricks/extensions/server/manifest.json"));
	const assets = read("geelooy/ai/promptAssets.js");
	const background = read("geelooy/scripts/tricks/extensions/server/background.js");
	const handlers = read("geelooy/scripts/tricks/extensions/server/backgroundHandlers.js");
	const injected = read("geelooy/scripts/tricks/extensions/server/jected.js");
	const resources = manifest.web_accessible_resources.flatMap(entry => entry.resources);

	for (const name of ["jected.js", "jectedBridge.js", "jectedResponse.js"]) {
		assert.ok(resources.includes(name));
		assert.match(assets, new RegExp(name.replace(".", "\\.")));
	}
	assert.match(background, /backgroundHandlers\.js/);
	assert.match(handlers, /direct-chat/);
	assert.match(injected, /awtsFetch\.directChat/);
	assert.doesNotMatch(`${background}\n${handlers}\n${injected}`, /error\?\.stack|\.stack\s*[,}]/);
});

test("direct relay keeps upstream ids behind opaque local keys", () => {
	const service = read("geelooy/ai/relay/direct/chatgpt/DirectService.mjs");
	const store = read("geelooy/ai/relay/direct/chatgpt/ConversationStore.mjs");

	assert.match(store, /BH_DIRECT_/);
	assert.match(service, /conversationKey/);
	assert.doesNotMatch(service, /return\s*\{[^}]*conversationId/s);
	assert.doesNotMatch(service, /parentMessageId\s*:/);
});
