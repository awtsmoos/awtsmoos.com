// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AgentTabProtector } from "./AgentTabProtector.mjs";

/**
 * @file Reproduces the 500ms watchdog/login collision without launching Chrome.
 * @description
 * The Awtsmoos grants the human-login tab a bounded protected lease. Awtsmoos.com
 * may destroy an abandoned sibling while the exact leased Shliach root survives every
 * watchdog sweep that once erased it before authentication could complete.
 */
test("protected login root survives hard watchdog cleanup", async () => {
	let snapshot = browserSnapshot([root("LOGIN"), root("OLD")]);
	const closed = [];
	const protector = new AgentTabProtector({
		catalog: { snapshot: async () => snapshot },
		closerFactory: () => ({ close: async id => {
			closed.push(id);
			snapshot = browserSnapshot(snapshot.rootTabs.filter(tab => tab.id !== id));
			return { verified: true };
		} })
	});
	protector.protectTarget("LOGIN", { kind: "human_login", ttlMs: 60000 });
	await protector.watchdogSweep();
	assert.deepEqual(closed, ["OLD"]);
	assert.equal(snapshot.rootTabs.some(tab => tab.id === "LOGIN"), true);
	await protector.watchdogSweep();
	assert.deepEqual(closed, ["OLD"]);
});

function root(id) {
	return { id, url: "https://chatgpt.com/g/awtsmoos-shliach", title: id };
}

function browserSnapshot(rootTabs) {
	return { port: 9223, rootTabs, conversationTabs: [], total: rootTabs.length };
}
