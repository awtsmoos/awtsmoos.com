//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Contract = require("../tools/chatgpt/runtime/queryPromptContract.js");

/**
 * @file Locks the SSR-versus-hydrated readiness boundary discovered against live ChatGPT.
 * @description The Awtsmoos trusts the hydrated living client rather than document.readyState;
 * Awtsmoos.com refuses the fallback form but permits interactive pages once Send is truly ready.
 */
function main() {
	const prompt = 'B"H\nmarker';
	const good = {
		readyState: "interactive",
		queryMatches: true,
		hydrated: true,
		sendFound: true,
		sendDisabled: false,
		rect: { width: 20, height: 20 }
	};
	assert.equal(
		Contract.promptFromUrl(`https://chatgpt.com/g/x?prompt=${encodeURIComponent(prompt)}`),
		prompt
	);
	assert.equal(Contract.ready(good), true);
	assert.equal(Contract.ready({ ...good, readyState: "loading" }), true);
	assert.equal(Contract.ready({ ...good, hydrated: false }), false);
	assert.equal(Contract.ready({ ...good, queryMatches: false }), false);
	assert.equal(Contract.ready({ ...good, sendDisabled: true }), false);
	assert.equal(Contract.ready({ ...good, rect: { width: 0, height: 20 } }), false);
	const readySource = Contract.readyExpression(prompt);
	assert.match(readySource, /tagName === 'DIV'/);
	assert.match(readySource, /getAttribute\('role'\) === 'textbox'/);
	assert.doesNotMatch(readySource, /innerText \|\| composer\.value/);
	const persisted = Contract.persistenceExpression(prompt);
	assert.match(persisted, /data-message-author-role=\"user\"/);
	assert.match(persisted, /\\\/c\\\//);
	assert.match(persisted, /persisted: !!found && match/);
	console.log(JSON.stringify({ ok: true, suite: "query-prompt-contract" }));
}

try {
	main();
} catch (error) {
	console.error(error?.stack || error);
	process.exitCode = 1;
}
