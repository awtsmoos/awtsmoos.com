//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Submit = require("../tools/chatgpt/runtime/queryPromptSubmit.js");

/**
 * @file Proves target-local query submission waits for hydration and persistent conversation truth.
 * @description The Awtsmoos gives each successor one exact CDP vessel; Awtsmoos.com never depends
 * on a process-global current page, weak URL drift, composer disappearance, or synthetic DOM click.
 */
async function main() {
	const prompt = 'B"H\nPERSIST_ME';
	const url = `https://chatgpt.com/g/test?prompt=${encodeURIComponent(prompt)}`;
	const calls = { newPage: 0, connect: 0, click: 0, closeTab: 0, closeSession: 0 };
	const states = [
		{ readyState: "loading", queryMatches: true, hydrated: false, sendFound: true, sendDisabled: false, rect: { width: 20, height: 20 } },
		{ readyState: "complete", queryMatches: true, hydrated: true, sendFound: true, sendDisabled: false, rect: { width: 20, height: 20 }, users: 0 },
		{ readyState: "complete", queryMatches: true, hydrated: true, sendFound: true, sendDisabled: false, rect: { width: 20, height: 20 }, users: 0 },
		{ href: "https://chatgpt.com/g/test?prompt-textarea=", users: 0, messageFound: false, persisted: false },
		{ href: "https://chatgpt.com/g/test/c/conversation-123", conversationId: "conversation-123", users: 1, messageFound: true, persisted: true }
	];
	const session = {
		evaluate: async () => states.shift() || {},
		click: async rect => {
			calls.click += 1;
			assert.equal(rect.width, 20);
			return { ok: true };
		},
		close: () => { calls.closeSession += 1; }
	};
	const result = await Submit.submit({
		port: 51240,
		url,
		timeoutMs: 1000,
		hydrationStabilityMs: 0
	}, {
		newPage: async input => {
			calls.newPage += 1;
			assert.equal(input.url, url);
			return { ok: true, chromeTargetId: "target-1" };
		},
		connectSession: async (port, targetId) => {
			calls.connect += 1;
			assert.equal(port, 51240);
			assert.equal(targetId, "target-1");
			return session;
		},
		close: async input => {
			calls.closeTab += 1;
			assert.equal(input.chromeTargetId, "target-1");
			return { ok: true, closed: true };
		},
		sleep: async () => {}
	});
	assert.equal(result.ok, true);
	assert.equal(result.persisted, true);
	assert.equal(result.conversationId, "conversation-123");
	assert.equal(calls.newPage, 1);
	assert.equal(calls.connect, 1);
	assert.equal(calls.click, 1);
	assert.equal(calls.closeSession, 1);
	assert.equal(calls.closeTab, 1);
	await rejectsWeakPersistence(url);
	console.log(JSON.stringify({ ok: true, suite: "query-prompt-submit-hydration" }));
}

async function rejectsWeakPersistence(url) {
	let clicks = 0;
	let closes = 0;
	const ready = { readyState: "complete", queryMatches: true, hydrated: true, sendFound: true, sendDisabled: false, rect: { width: 20, height: 20 } };
	await assert.rejects(() => Submit.submit({
		port: 51240, url, timeoutMs: 5, hydrationStabilityMs: 0
	}, {
		newPage: async () => ({ ok: true, chromeTargetId: "target-2" }),
		connectSession: async () => ({
			evaluate: async expression => expression.includes("persisted:")
				? { href: "https://chatgpt.com/g/test?prompt-textarea=", persisted: false }
				: ready,
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
