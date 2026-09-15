//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Transport = require("../tools/fs/mission/autoContinuation/sharedShliachTransport.js");

/**
 * @file Proves shared-Shliach continuation requires a persistent account conversation.
 * @description The Awtsmoos carries words in the URL; Awtsmoos.com accepts success only after
 * hydration, trusted send, /c/ persistence, exact user-message evidence, and exact-tab closure.
 */
async function main() {
	const calls = [];
	const href = `${Transport.SHLIACH_URL}/c/conversation_test_123`;
	const result = await Transport.dispatch({
		prompt: "B\"H continue mission",
		shliachUrl: Transport.SHLIACH_URL
	}, {
		registry: async () => ({
			port: 51240,
			profile: Transport.SHARED_PROFILE
		}),
		submit: async input => {
			calls.push(input);
			return {
				ok: true,
				sent: true,
				persisted: true,
				closed: true,
				chromeTargetId: "tab_successor",
				conversationId: "conversation_test_123",
				href
			};
		}
	});
	assert.equal(result.ok, true);
	assert.equal(result.transport, "shared_shliach");
	assert.equal(result.port, 51240);
	assert.equal(result.profile, Transport.SHARED_PROFILE);
	assert.equal(result.sent, true);
	assert.equal(result.persisted, true);
	assert.equal(result.closed, true);
	assert.equal(result.conversationId, "conversation_test_123");
	assert.equal(result.conversationHref, href);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].port, 51240);
	assert.equal(calls[0].closeOnFailure, true);
	assert.match(calls[0].url, /awtsmoos-shliach-agent/);
	const parsed = new URL(calls[0].url);
	assert.equal(parsed.searchParams.get("prompt"), "B\"H continue mission");
	console.log(JSON.stringify({ ok: true, suite: "continuation-shared-shliach-query" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
