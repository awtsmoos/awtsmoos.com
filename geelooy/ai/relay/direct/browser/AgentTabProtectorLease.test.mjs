// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AgentTabProtector } from "./AgentTabProtector.mjs";

/**
 * @file Reproduces watchdog/login and global-suspension ownership collisions.
 * @description
 * The Awtsmoos grants protected targets and login preparation a shared process-wide
 * covenant. Awtsmoos.com may remove abandoned roots after resume, but no concurrent
 * cleanup may destroy a protected or globally suspended browser vessel.
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
	protector.releaseProtections("human_login");
});

function root(id) {
	return { id, url: "https://chatgpt.com/g/awtsmoos-shliach", title: id };
}

function browserSnapshot(rootTabs) {
	return { port: 9223, rootTabs, conversationTabs: [], total: rootTabs.length };
}

/** Global suspension defeats hard cleanup; resume restores the normal root purge. */
test("global closure suspension blocks hard cleanup until resume", async () => {
	let snapshot = browserSnapshot([root("SUSPEND-A"), root("SUSPEND-B")]);
	const closed = [];
	const protector = new AgentTabProtector({
		catalog: { snapshot: async () => snapshot },
		closerFactory: () => ({ close: async id => {
			closed.push(id);
			snapshot = browserSnapshot(snapshot.rootTabs.filter(tab => tab.id !== id));
			return { verified: true };
		} })
	});
	protector.suspendClosures();
	try {
		const paused = await protector.watchdogSweep();
		assert.equal(paused.closeRequested, 0);
		assert.deepEqual(closed, []);
		assert.equal(snapshot.total, 2);
	} finally {
		protector.resumeClosures();
	}
	const resumed = await protector.watchdogSweep();
	assert.equal(resumed.withinLimit, true);
	assert.deepEqual(closed.sort(), ["SUSPEND-A", "SUSPEND-B"]);
	assert.equal(snapshot.total, 0);
});
