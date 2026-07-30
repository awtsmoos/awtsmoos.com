//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ManualLoginGate } = require("../relay/split-browser/commands/ManualLoginGate.cjs");

function fixture() {
	const events = [];
	let clock = 0;
	let reads = 0;
	const gate = new ManualLoginGate({
		openBrowser: async () => ({ ok: true, debugPort: 9333 }),
		synchronizeCookies: async () => events.push("cookies"),
		readSession: async () => {
			reads += 1;
			return reads === 2 ? { ok: true, status: "logged_in" } : { ok: false, status: "not_logged_in" };
		},
		closeBrowser: async () => { events.push("closed"); return { ok: true }; },
		sleep: async duration => { clock += duration; },
		now: () => clock,
		output: () => undefined
	});
	return { gate, events };
}

test("manual login keeps the authenticated dedicated browser available", async () => {
	const { gate, events } = fixture();
	const result = await gate.authenticate({}, { timeoutMs: 100, pollMs: 10 });
	assert.equal(result.status, "authenticated");
	assert.equal(result.browserClosed, false);
	assert.deepEqual(events, ["cookies", "cookies"]);
});

test("manual login supports explicit close on success", async () => {
	const { gate, events } = fixture();
	const result = await gate.authenticate({}, { timeoutMs: 100, pollMs: 10, closeOnSuccess: true });
	assert.equal(result.browserClosed, true);
	assert.deepEqual(events, ["cookies", "cookies", "closed"]);
});

test("manual login timeout closes browser", async () => {
	let clock = 0;
	let closes = 0;
	const gate = new ManualLoginGate({
		openBrowser: async () => ({ ok: true, debugPort: 9333 }),
		synchronizeCookies: async () => undefined,
		readSession: async () => ({ ok: false, status: "not_logged_in" }),
		closeBrowser: async () => { closes += 1; return { ok: true }; },
		sleep: async duration => { clock += duration; },
		now: () => clock,
		output: () => undefined
	});
	await assert.rejects(() => gate.authenticate({}, { timeoutMs: 20, pollMs: 10 }), error => error.code === "manual_login_timeout");
	assert.equal(closes, 1);
});
