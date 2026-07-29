//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../../..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");

/** Browser callers and server service default to the ChatGPT website. */
test("direct relay defaults to website mode", () => {
	const relay = read("geelooy/ai/js/chatgpt/direct/directRelay.js");
	const service = read("geelooy/ai/relay/direct/chatgpt/DirectService.mjs");
	assert.match(relay, /mode = "chatgpt-website"/);
	assert.match(service, /WebsiteLoginCoordinator/);
	assert.match(service, /FallbackConversationService/);
	assert.doesNotMatch(`${relay}\n${service}`, /direct\/(local|openai)|api\.openai\.com/);
});

/** Normal website submission observes but never intercepts the conversation POST. */
test("website turn leaves the ChatGPT request unchanged", () => {
	const executor = read("geelooy/ai/relay/direct/chatgpt/DirectTurnExecutor.mjs");
	const observer = read("geelooy/ai/relay/direct/chatgpt/ConversationRequestObserver.mjs");
	const interactor = read("geelooy/ai/relay/direct/browser/WebsitePromptInteractor.mjs");
	assert.match(executor, /WebsitePromptInteractor/);
	assert.match(executor, /ConversationRequestObserver/);
	assert.match(executor, /ConversationCompletionPoller/);
	assert.match(observer, /Network\.requestWillBeSent/);
	assert.match(observer, /Network\.getRequestPostData/);
	assert.doesNotMatch(observer, /Fetch\.(enable|failRequest|continueRequest)/);
	assert.match(interactor, /focusAndReplace\(composer, prompt\)/);
	assert.match(interactor, /clickNode\(send\)/);
});

/** Alternate provider trees and scripts do not exist. */
test("repository exposes only the website provider", () => {
	assert.equal(fs.existsSync(path.join(ROOT, "geelooy/ai/relay/direct/local")), false);
	assert.equal(fs.existsSync(path.join(ROOT, "geelooy/ai/relay/direct/openai")), false);
	const scripts = JSON.parse(read("package.json")).scripts;
	const aiScripts = Object.fromEntries(
		Object.entries(scripts).filter(([name]) => name.startsWith("ai:"))
	);
	assert.equal(Boolean(aiScripts["ai:website-stress"]), true);
	assert.equal(Boolean(aiScripts["ai:login"]), true);
	assert.equal(Object.keys(aiScripts).some(name => /model|setup/.test(name)), false);
});

/** Website continuation ids remain behind opaque local keys. */
test("website continuation stays private", () => {
	const store = read("geelooy/ai/relay/direct/chatgpt/ConversationStore.mjs");
	const service = read("geelooy/ai/relay/direct/chatgpt/FallbackConversationService.mjs");
	const stress = read("geelooy/ai/relay/direct/stress/FallbackStressReport.mjs");
	assert.match(store, /BH_DIRECT_/);
	assert.match(service, /conversationId/);
	assert.doesNotMatch(service, /conversationId:\s*result\.state\.conversationId/);
	assert.doesNotMatch(stress, /conversationKey:\s*record/);
});

/** Extension routing exposes only redacted capability and chat results. */
test("extension keeps website session data private", () => {
	const background = read("geelooy/scripts/tricks/extensions/server/backgroundHandlers.js");
	const injected = read("geelooy/scripts/tricks/extensions/server/jected.js");
	assert.match(background, /direct-capability/);
	assert.match(injected, /awtsFetch\.directCapability/);
	assert.match(injected, /awtsFetch\.directChat/);
	assert.doesNotMatch(`${background}\n${injected}`, /\.stack\s*[,}]/);
});
