//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ManualLoginGate } = require("../relay/split-browser/commands/ManualLoginGate.cjs");

/** Manual login closes the dedicated browser at the first authenticated verdict. */
test("manual login gate detects authentication and closes immediately", async () => {
	const events = [];
	let clock = 0;
	let reads = 0;
	const gate = new ManualLoginGate({
		openBrowser: async () => ({ ok: true, debugPort: 9333 }),
		synchronizeCookies: async () => events.push("cookies"),
		readSession: async () => {
			reads += 1;
			return reads === 2
				? { ok: true, status: "logged_in" }
				: { ok: false, status: "not_logged_in" };
		},
		closeBrowser: async () => {
			events.push("closed");
			return { ok: true };
		},
		sleep: async duration => {
			clock += duration;
		},
		now: () => clock,
		output: () => undefined
	});
	const result = await gate.authenticate({}, { timeoutMs: 100, pollMs: 10 });
	assert.equal(result.status, "authenticated");
	assert.equal(result.browserClosed, true);
	assert.equal(result.debugPort, 9333);
	assert.deepEqual(events, ["cookies", "cookies", "closed"]);
});

/** Timeout still closes the owned browser and returns only a coded failure. */
test("manual login timeout closes browser", async () => {
	let clock = 0;
	let closes = 0;
	const gate = new ManualLoginGate({
		openBrowser: async () => ({ ok: true, debugPort: 9333 }),
		synchronizeCookies: async () => undefined,
		readSession: async () => ({ ok: false, status: "not_logged_in" }),
		closeBrowser: async () => {
			closes += 1;
			return { ok: true };
		},
		sleep: async duration => {
			clock += duration;
		},
		now: () => clock,
		output: () => undefined
	});
	await assert.rejects(
		() => gate.authenticate({}, { timeoutMs: 20, pollMs: 10 }),
		error => error.code === "manual_login_timeout"
	);
	assert.equal(closes, 1);
});
