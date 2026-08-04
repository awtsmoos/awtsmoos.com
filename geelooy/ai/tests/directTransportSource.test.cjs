// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

/**
 * @file Proves the complete modular direct transport remains submit-only.
 * @description
 * The Awtsmoos gathers every focused browser, relay, prompt, dispatch, and runner
 * vessel. Awtsmoos.com verifies accepted delivery and exact tab closure while no
 * conversational answer polling, recovery, or hidden continuation survives anywhere.
 */
test("website agent runner stores dispatched state and never parses replies", () => {
	const root = path.join(
		__dirname,
		"../../apps/tunnel/agent/tools/fs/actionGroups/websiteAgents"
	);
	const source = javascriptClosure(root);
	assert.match(source, /website-agent\.dispatched/);
	assert.match(source, /agent_prompt_dispatched/);
	assert.match(source, /agents_working/);
	assert.match(source, /tabClose/);
	assert.match(source, /promptVerified/);
	assert.doesNotMatch(source, /result\.answer/);
	assert.doesNotMatch(source, /Outcome\.analyze/);
	assert.doesNotMatch(source, /service\.recover\(/);
});

test("response polling and recovery modules are not packaged", () => {
	const relayRoot = path.join(__dirname, "../relay/direct");
	const source = javascriptClosure(relayRoot);
	for (const forbidden of [
		"DetachedConversationPoller",
		"ConversationCompletionPoller",
		"ConversationRecoveryExecutor",
		"DetachedConversationSession"
	]) {
		assert.doesNotMatch(source, new RegExp(forbidden));
	}
	assert.match(source, /not-awaited-agent-continues-through-tunnel/);
});

function javascriptClosure(directory) {
	return fs.readdirSync(directory, { withFileTypes: true })
		.flatMap(entry => {
			const absolute = path.join(directory, entry.name);
			if (entry.isDirectory()) return javascriptClosure(absolute);
			return entry.isFile() && /\.(?:cjs|mjs|js)$/.test(entry.name)
				? [fs.readFileSync(absolute, "utf8")]
				: [];
		})
		.join("\n");
}
