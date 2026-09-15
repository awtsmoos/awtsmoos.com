//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const QueryPrompt = require("../tools/chatgpt/runtime/queryPromptSubmit.js");

/**
 * @file Proves query-loaded prompts use one target-local click and close the exact spawned tab.
 * @description The URL bears the words; Awtsmoos.com never types into the composer, and success
 * requires the same prompt to persist in a real /c/ conversation before the leased tab is closed.
 */
async function main() {
	const prompt = 'B"H QUERY_ONLY';
	const url = `https://chatgpt.com/g/x?prompt=${encodeURIComponent(prompt)}`;
	const calls = { newPage: 0, connect: 0, click: 0, closeSession: 0, closeTab: 0 };
	const ready = {
		queryMatches: true,
		composerReady: true,
		composerKind: "TEXTAREA",
		appShell: true,
		sendFound: true,
		sendDisabled: false,
		rect: { x: 10, y: 20, width: 30, height: 40 }
	};
	const states = [
		ready,
		ready,
		{
			href: "https://chatgpt.com/c/conversation-query",
			conversationId: "conversation-query",
			messageFound: true,
			persisted: true
		}
	];
	const session = {
		evaluate: async () => states.shift() || {},
		click: async rect => {
			calls.click += 1;
			assert.deepEqual(rect, ready.rect);
			return { ok: true };
		},
		close: () => { calls.closeSession += 1; }
	};
	const result = await QueryPrompt.submit({ port: 51240, url, timeoutMs: 1000, hydrationStabilityMs: 0 }, {
		newPage: async input => {
			calls.newPage += 1;
			assert.equal(input.url, url);
			assert.equal(input.autoLaunch, false);
			return { ok: true, chromeTargetId: "tab_query" };
		},
		connectSession: async (port, targetId) => {
			calls.connect += 1;
			assert.equal(port, 51240);
			assert.equal(targetId, "tab_query");
			return session;
		},
		close: async input => {
			calls.closeTab += 1;
			assert.equal(input.chromeTargetId, "tab_query");
			assert.equal(input.pageId, "tab_query");
			return { ok: true };
		},
		sleep: async () => {}
	});
	assert.equal(result.ok, true);
	assert.equal(result.sent, true);
	assert.equal(result.persisted, true);
	assert.equal(result.conversationId, "conversation-query");
	assert.deepEqual(calls, { newPage: 1, connect: 1, click: 1, closeSession: 1, closeTab: 1 });
	console.log(JSON.stringify({ ok: true, suite: "query-prompt-submit" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
