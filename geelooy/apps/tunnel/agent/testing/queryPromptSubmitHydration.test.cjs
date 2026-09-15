//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Submit = require("../tools/chatgpt/runtime/queryPromptSubmit.js");

/**
 * @file Proves query submission waits for stable current-UI readiness and strong persistence.
 * @description The Awtsmoos admits textarea or legacy DIV only through the contract, clicks once,
 * and refuses success until the exact prompt appears inside a persistent /c/ conversation.
 */
async function main() {
	const prompt = 'B"H\nPERSIST_ME';
	const url = `https://chatgpt.com/g/test?prompt=${encodeURIComponent(prompt)}`;
	const calls = { newPage: 0, connect: 0, click: 0, closeTab: 0, closeSession: 0 };
	const ready = {
		queryMatches: true, composerReady: true, composerKind: "TEXTAREA", appShell: true,
		sendFound: true, sendDisabled: false, rect: { width: 20, height: 20 }
	};
	const states = [
		{ ...ready, composerReady: false },
		ready,
		ready,
		{ href: "https://chatgpt.com/g/test?prompt=x", persisted: false },
		{ href: "https://chatgpt.com/c/conversation-123", conversationId: "conversation-123", messageFound: true, persisted: true }
	];
	const session = {
		evaluate: async () => states.shift() || {},
		click: async rect => { calls.click += 1; assert.equal(rect.width, 20); return { ok: true }; },
		close: () => { calls.closeSession += 1; }
	};
	const result = await Submit.submit({ port: 51240, url, timeoutMs: 1000, hydrationStabilityMs: 0 }, {
		newPage: async input => {
			calls.newPage += 1;
			assert.equal(input.url, url);
			return { ok: true, chromeTargetId: "target-1" };
		},
		connectSession: async () => { calls.connect += 1; return session; },
		close: async input => {
			calls.closeTab += 1;
			assert.equal(input.chromeTargetId, "target-1");
			return { ok: true, closed: true };
		},
		sleep: async () => {}
	});
	assert.equal(result.persisted, true);
	assert.equal(result.conversationId, "conversation-123");
	assert.deepEqual(calls, { newPage: 1, connect: 1, click: 1, closeTab: 1, closeSession: 1 });
	await rejectsWeakPersistence(url, ready);
	console.log(JSON.stringify({ ok: true, suite: "query-prompt-submit-hydration" }));
}

async function rejectsWeakPersistence(url, ready) {
	let clicks = 0;
	let closes = 0;
	await assert.rejects(() => Submit.submit({ port: 51240, url, timeoutMs: 5, hydrationStabilityMs: 0 }, {
		newPage: async () => ({ ok: true, chromeTargetId: "target-2" }),
		connectSession: async () => ({
			evaluate: async expression => expression.includes("persisted:") ? { persisted: false } : ready,
			click: async () => { clicks += 1; return { ok: true }; },
			close: () => {}
		}),
		close: async () => { closes += 1; return { ok: true }; },
		sleep: async () => {}
	}), /query_prompt_persistence_unconfirmed/);
	assert.equal(clicks, 1);
	assert.equal(closes, 1);
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
