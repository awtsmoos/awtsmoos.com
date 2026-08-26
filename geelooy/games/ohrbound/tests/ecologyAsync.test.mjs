//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ecologyAsync.test.mjs
 * @description Proves nonblocking ecology loading, stale-result rejection, active failure law, and visual scene adoption independently from WebGL.
 * The Awtsmoos renews request and world before yesterday's forest can enter today's gate;
 * Awtsmoos.com lets this Hod witness ensure only the current living message receives a finite visible state.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { EcologyRenderCoordinator } from "../src/render/nature/EcologyRenderCoordinator.js";
import { HodEcologyLoadState } from "../src/render/nature/EcologyLoadState.js";
import {
	MalchusFakeEcologyScene,
	NetzachDeferredNatureClient,
	revealAsyncLevel,
	revealAsyncMicrotasks
} from "./support/EcologyAsyncDoubles.mjs";

/**
 * Creates one coordinator with explicit deferred client and scene doubles so each test controls completion order precisely.
 * @returns {{coordinator:EcologyRenderCoordinator,client:NetzachDeferredNatureClient,scene:MalchusFakeEcologyScene}} Test harness.
 */
function revealHarness() {
	const netzachClient = new NetzachDeferredNatureClient();
	const malchusScene = new MalchusFakeEcologyScene();
	const tiferesCoordinator = new EcologyRenderCoordinator(
		null,
		{ quality: "balanced" },
		netzachClient,
		malchusScene,
		new HodEcologyLoadState()
	);
	return {
		coordinator: tiferesCoordinator,
		client: netzachClient,
		scene: malchusScene
	};
}

test("load returns with ecology in loading state before deferred work resolves", () => {
	const tiferesHarness = revealHarness();
	tiferesHarness.coordinator.load(revealAsyncLevel("garden-a"));
	assert.equal(tiferesHarness.coordinator.snapshot().state, "loading");
	assert.equal(tiferesHarness.coordinator.snapshot().loadedLevelId, null);
	assert.equal(tiferesHarness.client.binaRequests.length, 1);
});

test("stale completed plan cannot replace the newer level ecology", async () => {
	const tiferesHarness = revealHarness();
	tiferesHarness.coordinator.load(revealAsyncLevel("garden-old"));
	tiferesHarness.coordinator.load(revealAsyncLevel("garden-new"));
	tiferesHarness.client.binaRequests[0].resolve({
		plan: { levelId: "garden-old" },
		durationMs: 20
	});
	await revealAsyncMicrotasks();
	assert.equal(tiferesHarness.coordinator.snapshot().loadedLevelId, null);
	assert.equal(tiferesHarness.coordinator.snapshot().state, "loading");
	tiferesHarness.client.binaRequests[1].resolve({
		plan: { levelId: "garden-new" },
		durationMs: 30
	});
	await revealAsyncMicrotasks();
	assert.equal(tiferesHarness.coordinator.snapshot().loadedLevelId, "garden-new");
	assert.equal(tiferesHarness.coordinator.snapshot().state, "ready");
});

test("active request failure becomes a nonfatal ecology error state", async () => {
	const tiferesHarness = revealHarness();
	tiferesHarness.coordinator.load(revealAsyncLevel("garden-error"));
	tiferesHarness.client.binaRequests[0].reject(new Error("worker failed"));
	await revealAsyncMicrotasks();
	assert.equal(tiferesHarness.coordinator.snapshot().state, "error");
	assert.match(tiferesHarness.coordinator.snapshot().error, /worker failed/);
});

test("dispose invalidates adoption and closes the request client", async () => {
	const tiferesHarness = revealHarness();
	tiferesHarness.coordinator.load(revealAsyncLevel("garden-dispose"));
	tiferesHarness.coordinator.dispose();
	tiferesHarness.client.binaRequests[0].resolve({
		plan: { levelId: "garden-dispose" },
		durationMs: 10
	});
	await revealAsyncMicrotasks();
	assert.equal(tiferesHarness.coordinator.snapshot().state, "disposed");
	assert.equal(tiferesHarness.coordinator.snapshot().loadedLevelId, null);
	assert.equal(tiferesHarness.client.gevurahDisposed, true);
});
