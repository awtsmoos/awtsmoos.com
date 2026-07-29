//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../../..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const codeOnly = source => source
	.replace(/\/\*[\s\S]*?\*\//g, "")
	.replace(/^\s*\/\/.*$/gm, "");

/** Browser callers default to strict mode and never receive provider credentials. */
test("browser sender defaults to strict request-only transport", () => {
	const client = read("geelooy/ai/AwtsmoosGPTify.js");
	const relay = read("geelooy/ai/js/chatgpt/direct/directRelay.js");
	assert.match(client, /directMode = "strict-request-only"/);
	assert.match(relay, /mode = "strict-request-only"/);
	assert.match(relay, /model = null/);
	assert.match(relay, /thinkingEffort = null/);
	assert.doesNotMatch(`${client}\n${relay}`, /OPENAI_API_KEY|Bearer\s|api\.openai\.com/);
	assert.doesNotMatch(client, /backend-api\/conversation|proofToken|accessToken/);
});

/** Official API transport is native fetch only and contains no browser machinery. */
test("official API transport contains no DOM or Chrome path", () => {
	const files = [
		"OpenAiResponsesBody.mjs",
		"OpenAiResponsesParser.mjs",
		"OpenAiResponsesClient.mjs",
		"RequestOnlyApiConversationService.mjs",
		"OfficialApiCapability.mjs"
	].map(name => read(`geelooy/ai/relay/direct/openai/${name}`)).join("\n");
	const code = codeOnly(files);
	assert.match(code, /https:\/\/api\.openai\.com\/v1\/responses/);
	assert.match(code, /previous_response_id/);
	assert.match(code, /OPENAI_API_KEY/);
	assert.doesNotMatch(code, /document\.|window\.|\bDOM\.|\bInput\.|\bChrome\b|\bCarrier\b|WebSocket/);
	assert.doesNotMatch(code, /console\.(log|error)|process\.stdout/);
});

/** Local transport is loopback HTTP plus an isolated native process, never browser automation. */
test("local request-only transport contains no browser path", () => {
	const folder = "geelooy/ai/relay/direct/local";
	const files = fs.readdirSync(path.join(ROOT, folder))
		.filter(name => name.endsWith(".mjs"))
		.map(name => read(`${folder}/${name}`))
		.join("\n");
	const code = codeOnly(files);
	assert.match(code, /127\.0\.0\.1/);
	assert.match(code, /v1\/chat\/completions/);
	assert.doesNotMatch(code, /document\.|window\.|\bDOM\.|\bInput\.|prompt-textarea|CarrierPromptInteractor/);
});

/** Strict relay chooses HTTP providers and keeps browser fallback explicit. */
test("strict relay keeps browser fallback explicit", () => {
	const service = read("geelooy/ai/relay/direct/chatgpt/DirectService.mjs");
	const router = read("geelooy/ai/relay/direct/local/RequestOnlyProviderRouter.mjs");
	const api = read("geelooy/ai/relay/split-browser/directApi.cjs");
	assert.match(service, /official-api-request-only/);
	assert.match(service, /local-request-only/);
	assert.match(service, /page-authorized-fallback/);
	assert.match(router, /request_only_provider_unavailable/);
	assert.match(router, /local_model_unavailable/);
	assert.match(router, /official_api_key_required/);
	assert.match(api, /request_only_provider_unavailable/);
	assert.doesNotMatch(`${service}\n${router}`, /RequestOnlyCapabilityService/);
	assert.doesNotMatch(api, /error\?\.stack|detail:\s*error/);
});

/** Website challenge analysis remains separate from the default request router. */
test("web capability diagnostic remains read-only and isolated", () => {
	const host = read("geelooy/ai/relay/direct/browser/RequestOnlyHostController.mjs");
	const descriptor = read("geelooy/ai/relay/direct/chatgpt/RequestOnlyCapabilityDescriptor.mjs");
	assert.match(host, /route = "\/settings"/);
	assert.match(descriptor, /conversationPostSent: false/);
	assert.match(descriptor, /socketRequired: false/);
	assert.doesNotMatch(host, /Page\.addScriptToEvaluateOnNewDocument|new WebSocket/);
});

/** Provider ids and histories remain behind opaque local keys. */
test("provider continuations remain private", () => {
	const store = read("geelooy/ai/relay/direct/chatgpt/ConversationStore.mjs");
	const apiService = read("geelooy/ai/relay/direct/openai/RequestOnlyApiConversationService.mjs");
	const localService = read("geelooy/ai/relay/direct/local/LocalConversationService.mjs");
	const stress = read("geelooy/ai/relay/direct/stress/RequestOnlyStressReport.mjs");
	assert.match(store, /BH_DIRECT_/);
	assert.match(apiService, /responseId: result\.responseId/);
	assert.match(localService, /messages: savedMessages/);
	assert.match(stress, /BH_DIRECT_|resp_/);
	assert.doesNotMatch(stress, /records.*conversationKey/s);
});

/** Extension routing exposes only the redacted direct relay surface. */
test("extension exposes redacted direct capability and chat", () => {
	const background = read("geelooy/scripts/tricks/extensions/server/backgroundHandlers.js");
	const injected = read("geelooy/scripts/tricks/extensions/server/jected.js");
	assert.match(background, /direct-capability/);
	assert.match(injected, /awtsFetch\.directCapability/);
	assert.match(injected, /awtsFetch\.directChat/);
	assert.doesNotMatch(`${background}\n${injected}`, /OPENAI_API_KEY|Bearer\s|\.stack\s*[,}]/);
});
