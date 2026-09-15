//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const TargetSession = require("../tools/chatgpt/runtime/queryPromptTargetSession.js");

/**
 * @file Proves observation may reconnect but a Send click is never replayed.
 * @description The Awtsmoos permits a destroyed execution context to renew its reading vessel;
 * once pointer custody begins, even a retryable socket-shaped error cannot spawn a second click.
 */
async function main() {
	let opens = 0;
	let clicks = 0;
	let closes = 0;
	const channels = [
		{
			evaluate: async () => { throw new Error("query_prompt_socket_closed"); },
			click: async () => { clicks += 1; return { ok: true }; },
			close: () => { closes += 1; }
		},
		{
			evaluate: async () => ({ ready: true }),
			click: async () => {
				clicks += 1;
				throw new Error("query_prompt_socket_closed");
			},
			close: () => { closes += 1; }
		}
	];
	const session = await TargetSession.connect(51240, "target-1", 1000, {
		open: async () => {
			opens += 1;
			const channel = channels.shift();
			if (!channel) throw new Error("unexpected_channel_reopen");
			return channel;
		},
		sleep: async () => {}
	});
	assert.deepEqual(await session.evaluate("1"), { ready: true });
	assert.equal(opens, 2);
	assert.equal(closes, 1);
	await assert.rejects(
		() => session.click({ x: 1, y: 2, width: 3, height: 4 }),
		/query_prompt_socket_closed/
	);
	assert.equal(clicks, 1);
	assert.equal(opens, 2);
	session.close();
	assert.equal(closes, 2);
	console.log(JSON.stringify({ ok: true, suite: "query-prompt-target-session" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
