//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const QueryPrompt = require("../tools/chatgpt/runtime/queryPromptSubmit.js");

/**
 * @file Proves query-loaded prompts are sent without textarea mutation and exact tabs close.
 * @description The URL bears the words; Awtsmoos.com witnesses readiness, one click, departure,
 * and closure of the leased tab through injectable browser primitives.
 */
async function main() {
	const calls = { newPage: [], navigate: [], click: [], eval: [], close: [] };
	let probe = 0;
	const deps = {
		newPage: async input => {
			calls.newPage.push(input);
			return { ok: true, chromeTargetId: "tab_query" };
		},
		navigate: async input => {
			calls.navigate.push(input);
			return { ok: true };
		},
		click: async input => {
			calls.click.push(input);
			return { ok: true };
		},
		eval: async input => {
			calls.eval.push(input);
			probe += 1;
			const state = probe === 1
				? { href: "https://chatgpt.com/g/x?prompt=y", textLength: 12, users: 0, sendFound: true, sendDisabled: false }
				: { href: "https://chatgpt.com/g/x", textLength: 0, users: 1, sendFound: false, sendDisabled: false };
			return { result: { result: { valueSummary: { value: state } } } };
		},
		close: async input => {
			calls.close.push(input);
			return { ok: true };
		}
	};
	const result = await QueryPrompt.submit({
		port: 51240,
		url: "https://chatgpt.com/g/x?prompt=y",
		timeoutMs: 1000
	}, deps);
	assert.equal(result.ok, true);
	assert.equal(result.sent, true);
	assert.equal(calls.newPage.length, 1);
	assert.equal(calls.navigate[0].autoLaunch, false);
	assert.equal(calls.click.length, 1);
	assert.equal(calls.close.length, 1);
	assert.equal(calls.close[0].chromeTargetId, "tab_query");
	assert.equal(calls.close[0].pageId, "tab_query");
	console.log(JSON.stringify({ ok: true, suite: "query-prompt-submit" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
