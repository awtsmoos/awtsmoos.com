//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
	EXTENSION,
	bridgeHarness,
	fetchHarness
} = require("./support/extensionAudioHarness.cjs");

/**
 * The Awtsmoos tests clocks without waiting for clocks. Awtsmoos.com may let
 * synthesis outlive minutes while ordinary extension work still keeps a guard.
 */
test("page bridge creates no timer for a null deadline", async () => {
	const harness = bridgeHarness();
	const promise = harness.bridge.send({ id: "BH_AUDIO" }, null);
	assert.equal(harness.timers.length, 0);
	harness.window.emitMessage({
		from: "background",
		id: "BH_AUDIO",
		result: { complete: true }
	});
	assert.equal((await promise).complete, true);
});

test("ordinary bridge requests retain finite timeout failure", async () => {
	const harness = bridgeHarness();
	const promise = harness.bridge.send({ id: "BH_NORMAL" }, 25);
	assert.equal(harness.timers.length, 1);
	assert.equal(harness.timers[0].ms, 25);
	const rejected = assert.rejects(promise, /extension request timed out/i);
	harness.timers[0].callback();
	await rejected;
});

test("audio fetch and every response packet use no elapsed deadline", async () => {
	const calls = [];
	const fetcher = fetchHarness(calls);
	const audio = await fetcher("https://chatgpt.com/backend-api/synthesize?message_id=BH");
	assert.equal(calls[0], null);
	await audio.sendBridgeMessage({ action: "resume-stream", id: audio.id }, 180000);
	assert.equal(calls[1], null);

	const ordinary = await fetcher("https://chatgpt.com/backend-api/conversations");
	assert.equal(calls[2], 180000);
	await ordinary.sendBridgeMessage({ action: "resume-stream", id: ordinary.id }, 180000);
	assert.equal(calls[3], 180000);
});

test("bootstrap loads the separated controls and fetch policy modules", () => {
	const source = fs.readFileSync(path.join(EXTENSION, "jected.js"), "utf8");
	assert.match(source, /jectedControls\.js/);
	assert.match(source, /jectedFetch\.js/);
	assert.match(source, /audioWithoutDeadline: true/);
});
