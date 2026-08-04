// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { selectAgentTabs } from "./AgentTabSelection.mjs";

function snapshot(roots = [], conversations = []) {
	return {
		total: roots.length + conversations.length,
		rootTabs: roots.map(id => ({ id })),
		conversationTabs: conversations.map(id => ({ id }))
	};
}

test("zero allowance closes every root before a new turn", () => {
	const selected = selectAgentTabs(snapshot(["root-one", "root-two"]), {
		targetLimit: 0,
		rootAllowance: 0,
		hard: true
	});
	assert.deepEqual(selected.map(target => target.id), ["root-one", "root-two"]);
});

test("watchdog preserves one root and closes a stale conversation first", () => {
	const selected = selectAgentTabs(
		snapshot(["active-root"], ["stale-conversation"]),
		{ targetLimit: 1, rootAllowance: 1, hard: true }
	);
	assert.deepEqual(selected.map(target => target.id), ["stale-conversation"]);
});

test("watchdog closes surplus roots and conversations but preserves first root", () => {
	const selected = selectAgentTabs(
		snapshot(["active-root", "stale-root"], ["stale-conversation"]),
		{ targetLimit: 1, rootAllowance: 1, hard: true }
	);
	assert.deepEqual(selected.map(target => target.id), [
		"stale-root",
		"stale-conversation"
	]);
});

test("protected roots are a last resort when target limit is zero", () => {
	const selected = selectAgentTabs(snapshot(["root"], []), {
		targetLimit: 0,
		rootAllowance: 1,
		hard: true
	});
	assert.deepEqual(selected.map(target => target.id), ["root"]);
});
