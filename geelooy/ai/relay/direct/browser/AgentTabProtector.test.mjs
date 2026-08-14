// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { AgentTabProtector } from "./AgentTabProtector.mjs";

function fixture(rootIds, conversationIds) {
	const state = { roots: [...rootIds], conversations: [...conversationIds] };
	const catalog = {
		async snapshot() {
			return {
				port: 9224,
				total: state.roots.length + state.conversations.length,
				rootTabs: state.roots.map(id => ({ id })),
				conversationTabs: state.conversations.map(id => ({ id }))
			};
		}
	};
	const closerFactory = () => ({
		async close(id) {
			state.roots = state.roots.filter(item => item !== id);
			state.conversations = state.conversations.filter(item => item !== id);
			return { closed: true, verified: true, attempts: 1 };
		}
	});
	return { state, catalog, closerFactory };
}

test("beforeTurn closes every existing agent tab before opening the only tab", async () => {
	const state = fixture(["root"], ["conversation"]);
	const protector = new AgentTabProtector({ catalog: state.catalog, closerFactory: state.closerFactory });
	const result = await protector.beforeTurn();
	assert.equal(result.total, 0);
	assert.deepEqual(state.state.roots, []);
	assert.deepEqual(state.state.conversations, []);
	assert.equal(protector.status().maxTabs, 1);
	assert.equal(protector.status().rootAllowance, 0);
});

test("watchdog permits one in-flight tab but eliminates every excess tab", async () => {
	const state = fixture(["root-one", "root-two"], ["conversation"]);
	const protector = new AgentTabProtector({ catalog: state.catalog, closerFactory: state.closerFactory });
	const result = await protector.watchdogSweep();
	assert.equal(result.total, 1);
	assert.equal(state.state.roots.length + state.state.conversations.length, 1);
});
