//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Contract = require("../tools/chatgpt/runtime/queryPromptContract.js");

/**
 * @file Locks current textarea and legacy DIV readiness without allowing weak fallback clicks.
 * @description The Awtsmoos lets the composer shape evolve while exact query identity, app-shell
 * presence and visible enabled Send remain the invariant gate before one trusted pointer gesture.
 */
function main() {
	const prompt = 'B"H\nmarker';
	const base = {
		queryMatches: true,
		composerReady: true,
		appShell: true,
		sendFound: true,
		sendDisabled: false,
		rect: { width: 20, height: 20 }
	};
	assert.equal(Contract.ready({ ...base, composerKind: "TEXTAREA" }), true);
	assert.equal(Contract.ready({ ...base, composerKind: "DIV" }), true);
	assert.equal(Contract.ready({ ...base, queryMatches: false }), false);
	assert.equal(Contract.ready({ ...base, composerReady: false }), false);
	assert.equal(Contract.ready({ ...base, appShell: false }), false);
	assert.equal(Contract.ready({ ...base, sendDisabled: true }), false);
	assert.equal(Contract.ready({ ...base, rect: { width: 0, height: 20 } }), false);
	assert.equal(
		Contract.promptFromUrl(`https://chatgpt.com/g/x?prompt=${encodeURIComponent(prompt)}`),
		prompt
	);
	const source = Contract.readyExpression(prompt);
	assert.match(source, /tag === 'TEXTAREA'/);
	assert.match(source, /legacyEditable/);
	assert.match(source, /document\.querySelector\('main'\)/);
	assert.doesNotMatch(source, /composer\.value/);
	const persistence = Contract.persistenceExpression(prompt);
	assert.match(persistence, /data-message-author-role=\"user\"/);
	assert.match(persistence, /persisted: !!found && match/);
	console.log(JSON.stringify({ ok: true, suite: "query-prompt-contract" }));
}

main();
