// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const { ManualLoginGate } = require("../relay/split-browser/commands/ManualLoginGate.cjs");

function fixture() {
	const events = [];
	let clock = 0;
	let reads = 0;
	const gate = new ManualLoginGate({
		openBrowser: async () => ({ ok: true, debugPort: 9333 }),
		openLoginPage: async options => {
			events.push(`page:${options.debugPort}`);
			return { ok: true };
		},
		synchronizeCookies: async () => events.push("cookies"),
		readSession: async () => {
			reads += 1;
			return reads === 2 ? { ok: true, status: "logged_in" } :
				{ ok: false, status: "not_logged_in" };
		},
		closeBrowser: async () => { events.push("closed"); return { ok: true }; },
		sleep: async duration => { clock += duration; },
		now: () => clock,
		output: () => undefined
	});
	return { gate, events };
}

test("manual login opens a human page and keeps authenticated Chrome", async () => {
	const { gate, events } = fixture();
	const result = await gate.authenticate({}, { timeoutMs: 100, pollMs: 10 });
	assert.equal(result.status, "authenticated");
	assert.equal(result.browserClosed, false);
	assert.deepEqual(events, ["page:9333", "cookies", "cookies"]);
});

test("manual login supports explicit close on success", async () => {
	const { gate, events } = fixture();
	const result = await gate.authenticate({}, {
		timeoutMs: 100,
		pollMs: 10,
		closeOnSuccess: true
	});
	assert.equal(result.browserClosed, true);
	assert.deepEqual(events, ["page:9333", "cookies", "cookies", "closed"]);
});

test("manual login timeout preserves persistent Chrome by default", async () => {
	const { gate, closes } = timeoutFixture();
	await assert.rejects(
		() => gate.authenticate({}, { timeoutMs: 20, pollMs: 10 }),
		error => error.code === "manual_login_timeout" && error.browserClosed === false
	);
	assert.equal(closes(), 0);
});

test("manual login supports explicit close on timeout", async () => {
	const { gate, closes } = timeoutFixture();
	await assert.rejects(
		() => gate.authenticate({}, {
			timeoutMs: 20,
			pollMs: 10,
			closeOnTimeout: true
		}),
		error => error.code === "manual_login_timeout" && error.browserClosed === true
	);
	assert.equal(closes(), 1);
});

function timeoutFixture() {
	let clock = 0;
	let closeCount = 0;
	const gate = new ManualLoginGate({
		openBrowser: async () => ({ ok: true, debugPort: 9333 }),
		openLoginPage: async () => ({ ok: true }),
		synchronizeCookies: async () => undefined,
		readSession: async () => ({ ok: false, status: "not_logged_in" }),
		closeBrowser: async () => { closeCount += 1; return { ok: true }; },
		sleep: async duration => { clock += duration; },
		now: () => clock,
		output: () => undefined
	});
	return { gate, closes: () => closeCount };
}
