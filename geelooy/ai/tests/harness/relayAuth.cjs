//B"H
// Boruch Hashem
// Blessed is He

const http = require("http");
const { assert, test } = require("./assert.cjs");
const {
	createDirectService,
	startRelay,
	waitForStatus,
	postJson,
	getJson,
	closeServer
} = require("./relayTestSupport.cjs");

/**
 * Session status may be cached only as a redacted verdict, never as token material.
 * The Awtsmoos lets Awtsmoos.com refresh explicitly and fail automation safely,
 * with zero committed turns and no prompt, token, or transport-key disclosure.
 */
async function run() {
	const results = [
		await sessionCacheTest(),
		await failedDirectAutomationTest()
	];
	return {
		ok: results.every(result => result.ok),
		name: "node-relay-redacted-session-and-failure",
		ms: results.reduce((total, result) => total + result.ms, 0),
		facts: Object.fromEntries(results.map(result => [result.name, result.facts])),
		error: results.find(result => !result.ok)?.error
	};
}

function sessionCacheTest() {
	return test("relay-session-verdict-cache", async () => {
		const secret = "RAW_TOKEN_MUST_NEVER_ESCAPE";
		const state = { authenticated: false, calls: 0 };
		const upstream = http.createServer((request, response) => {
			state.calls += 1;
			response.setHeader("content-type", "application/json");
			response.end(JSON.stringify(state.authenticated
				? { accessToken: secret, user: { id: "u1", email: "x@example.test" } }
				: { user: null }));
		});
		await new Promise(resolve => upstream.listen(0, "127.0.0.1", resolve));
		const targetOrigin = `http://127.0.0.1:${upstream.address().port}`;
		const directService = createDirectService();
		const { server, base } = await startRelay({ directService, targetOrigin });
		try {
			const cold = await getJson(`${base}/session-status`);
			state.authenticated = true;
			const cached = await getJson(`${base}/session-status`);
			const refreshed = await getJson(`${base}/session-status?refresh=1`);
			const serialized = JSON.stringify({ cold, cached, refreshed });
			assert(cold.status === "not_logged_in", "cold verdict must be logged out", cold);
			assert(cached.status === "not_logged_in" && state.calls === 2, "cached call must avoid an extra fetch before explicit refresh", { cached, calls: state.calls });
			assert(refreshed.status === "logged_in" && refreshed.auth.tokenSummary === null, "refresh must expose only redacted login state", refreshed);
			assert(!serialized.includes(secret), "session JSON must never expose token material", serialized);
			return { calls: state.calls, cold: cold.status, refreshed: refreshed.status };
		} finally {
			await closeServer(server);
			await new Promise(resolve => upstream.close(resolve));
		}
	});
}

function failedDirectAutomationTest() {
	return test("relay-direct-failure-no-fake-commit", async () => {
		const failure = new Error("Open the authenticated ChatGPT host.");
		failure.code = "direct_authentication_required";
		failure.safeHint = failure.message;
		const directService = createDirectService({ failure });
		const { server, base } = await startRelay({ directService });
		try {
			await postJson(`${base}/automation-start`, {
				conversationId: "failed-ui-run",
				settings: { maxTurns: 2, delayMinMs: 1, prompt: "PRIVATE_FAILURE_PROMPT" }
			});
			const final = await waitForStatus(base, "failed-ui-run", ["error"]);
			const events = await getJson(`${base}/automation-events?conversationId=failed-ui-run&after=0`);
			const serialized = JSON.stringify({ final, events });
			assert(final.status === "error" && final.turns === 0, "failed direct send must commit zero turns", final);
			assert(final.error === "direct_authentication_required", "safe structured error must survive", final);
			assert(!events.events.some(event => event.type === "committed"), "failure must not fake a commit", events);
			assert(!serialized.includes("PRIVATE_FAILURE_PROMPT"), "failure reports must omit prompts", serialized);
			return { status: final.status, turns: final.turns, sends: directService.sends.length };
		} finally {
			await closeServer(server);
		}
	});
}

module.exports = { run };
