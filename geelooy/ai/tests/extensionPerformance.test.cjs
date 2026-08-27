//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../..");
const EXTENSION = path.join(ROOT, "scripts/tricks/extensions/server");
const read = relative => fs.readFileSync(path.join(EXTENSION, relative), "utf8");

/**
 * The Awtsmoos proves that Awtsmoos.com startup parses one manifest bridge and no
 * retired automation façades, while the live turn path reaches direct relay only.
 */
test("content bridge relies on manifest injection only", () => {
	const background = read("background.js");
	assert.doesNotMatch(background, /webNavigation|tabs\.onUpdated|scripting\.executeScript/);
	assert.match(background, /directRelayClient\.js/);
});

test("service worker skips retired chat and polling facades", () => {
	const background = read("background.js");
	const runner = read("bgAutomation/engineTurnRunner.js");
	assert.doesNotMatch(background, /settledConversationPoller\.js|bgAutomation\/chatgpt\.js/);
	assert.doesNotMatch(runner, /AwtsmoosBgChatGpt/);
	assert.match(runner, /AwtsmoosBgSendVerifier\.sendAndVerify/);
});

test("background automation live path uses only direct relay continuation", () => {
	const liveFiles = [
		"bgAutomation/sendVerifier.js",
		"bgAutomation/engineTurnRunner.js",
		"bgAutomation/turnState.js"
	];
	const source = liveFiles.map(read).join("\n");
	assert.match(source, /AwtsmoosDirectRelayClient/);
	assert.match(source, /BH_DIRECT_/);
	assert.doesNotMatch(source, /\/api\/auth\/session|backend-api\/conversation|Authorization|Bearer|accessToken/);
	assert.doesNotMatch(source, /parentMessageId|current_node|setInterval/);
});

test("non-message relay operations contain no seven-second pacing", () => {
	const source = ["directRelayClient.js", "backgroundHandlers.js"].map(read).join("\n");
	assert.doesNotMatch(source, /7000|7_000/);
});

test("touched extension sources remain small and tab-indented", () => {
	const files = [
		"directRelayPayload.js", "directRelayClient.js", "backgroundHandlers.js", "background.js",
		"bgAutomation/api.js", "bgAutomation/authErrors.js", "bgAutomation/chatgpt.js",
		"bgAutomation/engine.js", "bgAutomation/engineLifecycle.js",
		"bgAutomation/engineScheduler.js", "bgAutomation/engineTurnRunner.js",
		"bgAutomation/sendVerifier.js", "bgAutomation/settledConversationPoller.js",
		"bgAutomation/storage.js", "bgAutomation/storageCodec.js",
		"bgAutomation/streamPacketCompactor.js", "bgAutomation/streamCompatibility.js",
		"bgAutomation/turnState.js"
	];
	for (const file of files) {
		const source = read(file);
		assert.ok(source.split(/\r?\n/).length <= 120, `${file} exceeds 120 lines`);
		assert.doesNotMatch(source, /^ +(?!\*)\S/m, `${file} contains space-indented code`);
	}
});
