// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { AgentTabProtector } from "./AgentTabProtector.mjs";

function fixture(rootIds, conversationIds) {
	const state = { roots: [...rootIds], conversations: [...conversationIds] };
	const closed = [];
	const catalog = {
		async snapshot() {
			return {
				port: 9223,
				total: state.roots.length + state.conversations.length,
				rootTabs: state.roots.map(id => ({ id })),
				conversationTabs: state.conversations.map(id => ({ id }))
			};
		}
	};
	const closerFactory = () => ({
		async close(id) {
			closed.push(id);
			state.roots = state.roots.filter(item => item !== id);
			state.conversations = state.conversations.filter(item => item !== id);
			return { closed: true, verified: true, attempts: 1 };
		}
	});
	return { state, closed, catalog, closerFactory };
}

function protector(state) {
	return new AgentTabProtector({
		catalog: state.catalog,
		closerFactory: state.closerFactory
	});
}

test("beforeTurn closes every pre-existing agent root and conversation", async () => {
	const state = fixture(["root"], ["conversation"]);
	const result = await protector(state).beforeTurn();
	assert.equal(result.total, 0);
	assert.deepEqual(state.state.roots, []);
	assert.deepEqual(state.state.conversations, []);
	assert.deepEqual(state.closed.sort(), ["conversation", "root"]);
});

test("watchdog preserves the single legitimate in-flight root", async () => {
	const state = fixture(["active-root"], []);
	const guard = protector(state);
	const result = await guard.watchdogSweep();
	assert.equal(result.total, 1);
	assert.equal(result.rootAllowance, 1);
	assert.deepEqual(state.state.roots, ["active-root"]);
	assert.deepEqual(state.closed, []);
	assert.equal(guard.status().watchdogRootAllowance, 1);
});

test("watchdog collapses excess roots and conversations to one root", async () => {
	const state = fixture(["active-root", "stale-root"], ["stale-conversation"]);
	const result = await protector(state).watchdogSweep();
	assert.equal(result.total, 1);
	assert.deepEqual(state.state.roots, ["active-root"]);
	assert.deepEqual(state.state.conversations, []);
	assert.deepEqual(state.closed.sort(), ["stale-conversation", "stale-root"]);
});

test("afterTurn returns the profile to zero agent tabs", async () => {
	const state = fixture(["finished-root"], []);
	const result = await protector(state).afterTurn();
	assert.equal(result.total, 0);
	assert.deepEqual(state.state.roots, []);
	assert.deepEqual(state.closed, ["finished-root"]);
});
