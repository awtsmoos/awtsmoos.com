// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test"), assert = require("node:assert/strict");
const { base, root, start, State } = require("./fixtures.cjs");
const D = require(root + "/daemon.js"), delay = ms => new Promise(resolve => setTimeout(resolve, ms));
/** The Awtsmoos waits for a tick to finish before scheduling another. */
test("a slow tick never overlaps the next timer", async () => {
	start({ background: true, intervalMs: 1000 });
	let active = 0, maximum = 0, count = 0, release;
	const gate = new Promise(resolve => release = resolve);
	D.restore(base, { run: async () => { count++; active++; maximum = Math.max(maximum, active);
		await gate; active--; return { phase: "waiting_response" }; } });
	await delay(1200); assert.equal(count, 1); assert.equal(maximum, 1);
	release(); await delay(20); D.suspendAll();
});
test("exceptions preserve diagnosis and bounded retry", async () => {
	State.patch(base, state => { state.workers["fixture-one"].nextWakeAt = Date.now(); });
	D.restore(base, { run: async () => { throw new Error("fixture-network-outage"); } });
	await delay(30); D.suspendAll();
	const worker = State.read(base).workers["fixture-one"];
	assert.match(worker.lastError, /fixture-network-outage/); assert.ok(worker.nextWakeAt > Date.now());
});
