// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { AgentTabProtector } from "./AgentTabProtector.mjs";

function fixture(rootIds, conversationIds) {
	const state = { roots: [...rootIds], conversations: [...conversationIds] };
	const catalog = {
		snapshot: async () => ({
			port: 9224,
			total: state.roots.length + state.conversations.length,
			rootTabs: state.roots.map(id => ({ id })),
			conversationTabs: state.conversations.map(id => ({ id }))
		})
	};
	const closerFactory = () => ({
		close: async id => {
			state.roots = state.roots.filter(item => item !== id);
			state.conversations = state.conversations.filter(item => item !== id);
			return { closed: true, verified: true, attempts: 1 };
		}
	});
	return { state, catalog, closerFactory };
}

test("beforeTurn creates a real slot by closing the remaining root", async () => {
	const state = fixture(["root"], ["conversation"]);
	const protector = new AgentTabProtector({
		catalog: state.catalog, closerFactory: state.closerFactory, maxTabs: 2
	});
	const result = await protector.beforeTurn();
	assert.equal(result.total, 1);
	assert.deepEqual(state.state.roots, []);
	assert.deepEqual(state.state.conversations, ["conversation"]);
	assert.equal(protector.status().closedTabs, 1);
});

test("watchdog restores the hard cap and prefers stale roots", async () => {
	const state = fixture(["root-one", "root-two"], ["one", "two"]);
	const protector = new AgentTabProtector({
		catalog: state.catalog, closerFactory: state.closerFactory, maxTabs: 2
	});
	const result = await protector.watchdogSweep();
	assert.equal(result.total, 2);
	assert.deepEqual(state.state.roots, []);
	assert.deepEqual(state.state.conversations, ["one", "two"]);
});
