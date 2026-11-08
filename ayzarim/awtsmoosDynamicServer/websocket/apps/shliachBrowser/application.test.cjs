// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { createShliachBrowserApplication } = require("./application.js");
const { CODE_TTL_MS } = require("./protocol.js");

/**
 * Proves the Shliach browser relay pairs one verified agent with one
 * browser by short code, forwards messages only between the pair, and
 * refuses everything else (anonymous create, bad code, expired code,
 * second browser, sending with no peer).
 */

function fakeClient(id) {
	const sent = [];
	return {
		id,
		sent,
		send(message) {
			sent.push(message);
			return true;
		},
	};
}

function context(identity, client) {
	return {
		identity: identity || null,
		client,
		sendEvent(targetClient, type, payload) {
			targetClient.send({
				protocol: "awtsmoos.realtime",
				application: "shliach-browser",
				version: 1,
				type,
				payload,
			});
		},
	};
}

function request(type, payload) {
	return { payload, type };
}

function verifiedAgent(id) {
	return { accountId: id, assurance: "verified" };
}

test("shliach.create requires a verified agent identity", async () => {
	const app = createShliachBrowserApplication();
	const agent = fakeClient("agent-1");
	await assert.rejects(
		app.handleVersioned(context(null, agent), request("shliach.create", {})),
		(error) => error.code === "SHLIACH_BROWSER_AUTH_REQUIRED"
	);
	await assert.rejects(
		app.handleVersioned(context({ assurance: "anonymous" }, agent), request("shliach.create", {})),
		(error) => error.code === "SHLIACH_BROWSER_AUTH_REQUIRED"
	);
});

test("shliach.create issues a 6-character code and join pairs the browser", async () => {
	const app = createShliachBrowserApplication();
	const agent = fakeClient("agent-1");
	const browser = fakeClient("browser-1");
	const created = await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.create", {}));
	assert.equal(created.type, "shliach.created");
	assert.match(created.payload.code, /^[A-HJ-NP-Z2-9]{6}$/);
	assert.equal(created.payload.expiresAt - Date.now() > CODE_TTL_MS - 5000, true);
	const joined = await app.handleVersioned(context(null, browser), request("shliach.join", { code: created.payload.code, role: "browser" }));
	assert.equal(joined.type, "shliach.joined");
	assert.equal(joined.payload.paired, true);
	// The agent is told its browser arrived.
	const notice = agent.sent.find((m) => m.type === "shliach.browser-joined");
	assert.ok(notice, "agent should receive shliach.browser-joined");
	assert.equal(notice.payload.code, created.payload.code);
	const status = await app.handleVersioned(context(null, browser), request("shliach.status", {}));
	assert.equal(status.payload.paired, true);
	assert.equal(status.payload.role, "browser");
});

test("shliach.join rejects a bad code and a code for the wrong role", async () => {
	const app = createShliachBrowserApplication();
	const agent = fakeClient("agent-1");
	const browser = fakeClient("browser-1");
	await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.create", {}));
	await assert.rejects(
		app.handleVersioned(context(null, browser), request("shliach.join", { code: "ZZZZZZ", role: "browser" })),
		(error) => error.code === "SHLIACH_BROWSER_CODE_INVALID"
	);
	await assert.rejects(
		app.handleVersioned(context(null, browser), request("shliach.join", { code: "", role: "browser" })),
		(error) => error.code === "SHLIACH_BROWSER_CODE_REQUIRED"
	);
	await assert.rejects(
		app.handleVersioned(context(null, browser), request("shliach.join", { code: "ABCDEF", role: "agent" })),
		(error) => error.code === "SHLIACH_BROWSER_ROLE_INVALID"
	);
});

test("an expired code cannot be joined", async () => {
	let now = 1000000;
	const app = createShliachBrowserApplication({ now: () => now });
	const agent = fakeClient("agent-1");
	const browser = fakeClient("browser-1");
	const created = await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.create", {}));
	now += CODE_TTL_MS + 1000;
	await assert.rejects(
		app.handleVersioned(context(null, browser), request("shliach.join", { code: created.payload.code, role: "browser" })),
		(error) => error.code === "SHLIACH_BROWSER_CODE_INVALID"
	);
});

test("a code pairs exactly one browser; a second browser is refused", async () => {
	const app = createShliachBrowserApplication();
	const agent = fakeClient("agent-1");
	const first = fakeClient("browser-1");
	const second = fakeClient("browser-2");
	const created = await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.create", {}));
	await app.handleVersioned(context(null, first), request("shliach.join", { code: created.payload.code, role: "browser" }));
	await assert.rejects(
		app.handleVersioned(context(null, second), request("shliach.join", { code: created.payload.code, role: "browser" })),
		(error) => error.code === "SHLIACH_BROWSER_ALREADY_PAIRED"
	);
});

test("shliach.send forwards only between the pair, and fails with no peer", async () => {
	const app = createShliachBrowserApplication();
	const agent = fakeClient("agent-1");
	const browser = fakeClient("browser-1");
	const outsider = fakeClient("browser-2");
	const created = await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.create", {}));
	// No browser yet: the agent cannot send.
	await assert.rejects(
		app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.send", { data: { command: "ping" } })),
		(error) => error.code === "SHLIACH_BROWSER_NO_PEER"
	);
	await app.handleVersioned(context(null, browser), request("shliach.join", { code: created.payload.code, role: "browser" }));
	// Agent -> browser.
	const sent = await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.send", { data: { command: "ping" } }));
	assert.equal(sent.type, "shliach.sent");
	assert.equal(sent.payload.delivered, true);
	const toBrowser = browser.sent.find((m) => m.type === "shliach.message");
	assert.ok(toBrowser, "browser should receive shliach.message");
	assert.equal(toBrowser.payload.from, "agent");
	assert.deepEqual(toBrowser.payload.data, { command: "ping" });
	// Browser -> agent.
	await app.handleVersioned(context(null, browser), request("shliach.send", { data: { ok: true } }));
	const toAgent = agent.sent.find((m) => m.type === "shliach.message");
	assert.ok(toAgent, "agent should receive shliach.message");
	assert.equal(toAgent.payload.from, "browser");
	// An outsider that never joined cannot send (it has no room).
	await assert.rejects(
		app.handleVersioned(context(null, outsider), request("shliach.send", { data: { command: "ping" } })),
		(error) => error.code === "SHLIACH_BROWSER_NO_PEER"
	);
	// A send with no data is rejected.
	await assert.rejects(
		app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.send", {})),
		(error) => error.code === "SHLIACH_BROWSER_DATA_REQUIRED"
	);
});

test("a new code from the same account invalidates the old one", async () => {
	const app = createShliachBrowserApplication();
	const agent = fakeClient("agent-1");
	const browser = fakeClient("browser-1");
	const first = await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.create", {}));
	const second = await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.create", {}));
	assert.notEqual(second.payload.code, first.payload.code);
	await assert.rejects(
		app.handleVersioned(context(null, browser), request("shliach.join", { code: first.payload.code, role: "browser" })),
		(error) => error.code === "SHLIACH_BROWSER_CODE_INVALID"
	);
	const joined = await app.handleVersioned(context(null, browser), request("shliach.join", { code: second.payload.code, role: "browser" }));
	assert.equal(joined.payload.paired, true);
});

test("browser disconnect unpairs but keeps the room; agent disconnect closes it", async () => {
	const app = createShliachBrowserApplication();
	const agent = fakeClient("agent-1");
	const browser = fakeClient("browser-1");
	const created = await app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.create", {}));
	await app.handleVersioned(context(null, browser), request("shliach.join", { code: created.payload.code, role: "browser" }));
	// Browser disconnects: the agent is told, the room survives, the
	// browser can rejoin with the same code.
	app.disconnect({ client: browser });
	const leftNotice = agent.sent.find((m) => m.type === "shliach.peer-left");
	assert.ok(leftNotice, "agent should receive shliach.peer-left");
	assert.equal(leftNotice.payload.role, "browser");
	const rejoined = await app.handleVersioned(context(null, browser), request("shliach.join", { code: created.payload.code, role: "browser" }));
	assert.equal(rejoined.payload.paired, true);
	// Agent disconnects: the room closes and the browser is told.
	app.disconnect({ client: agent });
	const closedNotice = browser.sent.find((m) => m.type === "shliach.peer-left");
	assert.ok(closedNotice, "browser should receive shliach.peer-left");
	assert.equal(closedNotice.payload.role, "agent");
	await assert.rejects(
		app.handleVersioned(context(null, browser), request("shliach.join", { code: created.payload.code, role: "browser" })),
		(error) => error.code === "SHLIACH_BROWSER_CODE_INVALID"
	);
});

test("unknown request types are rejected", async () => {
	const app = createShliachBrowserApplication();
	const agent = fakeClient("agent-1");
	await assert.rejects(
		app.handleVersioned(context(verifiedAgent("account-1"), agent), request("shliach.nope", {})),
		(error) => error.code === "SHLIACH_BROWSER_REQUEST_UNKNOWN"
	);
});
