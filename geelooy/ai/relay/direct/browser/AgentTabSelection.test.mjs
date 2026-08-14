// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { selectAgentTabs } from "./AgentTabSelection.mjs";

const page = id => ({ id });

test("launch capacity sacrifices the final idle root before a conversation", () => {
	const selected = selectAgentTabs({
		total: 2,
		rootTabs: [page("root")],
		conversationTabs: [page("conversation")]
	}, { targetLimit: 1, rootAllowance: 1, hard: false });
	assert.deepEqual(selected.map(item => item.id), ["root"]);
});

test("hard recovery closes roots before excess conversations", () => {
	const selected = selectAgentTabs({
		total: 4,
		rootTabs: [page("root")],
		conversationTabs: [page("one"), page("two"), page("three")]
	}, { targetLimit: 2, rootAllowance: 1, hard: true });
	assert.deepEqual(selected.map(item => item.id), ["root", "three"]);
});

test("soft admission never closes active conversations", () => {
	const selected = selectAgentTabs({
		total: 3,
		rootTabs: [],
		conversationTabs: [page("one"), page("two"), page("three")]
	}, { targetLimit: 1, rootAllowance: 1, hard: false });
	assert.deepEqual(selected, []);
});
