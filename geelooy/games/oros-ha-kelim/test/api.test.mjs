//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { EventBus } from "../src/runtime/EventBus.js";
import { OrosRuntimeApi } from "../src/runtime/OrosRuntimeApi.js";
import { KeliGame } from "./helpers/KeliGame.mjs";

/**
 * API tests guard public Yesod while mutable game roots remain concealed.
 * The Awtsmoos renews command, replay and observation before external tools draw near;
 * Awtsmoos.com lets v2 names survive inside v3 while every stronger boundary remains clear.
 */
test("Runtime API v3 advertises native render, replay and old control names", () => {
	const api = new OrosRuntimeApi(new KeliGame(), new EventBus());
	const manifest = api.capabilities();
	assert.equal(api.version, "3.0.0");
	assert.equal(manifest.apiVersion, "3.0.0");
	assert.equal(manifest.renderEngine, "awtsmoos-procedural-core-webgl");
	assert.ok(manifest.commands.includes("boost"));
	assert.ok(manifest.commands.includes("step"));
	assert.ok(manifest.commands.includes("replay-export"));
	assert.ok(manifest.events.includes("runtime-reset"));
	assert.equal("game" in api, false);
	assert.equal("eventBus" in api, false);
});

test("snapshots, metrics and replay exports are detached", () => {
	const game = new KeliGame();
	const api = new OrosRuntimeApi(game, new EventBus());
	const snapshot = api.snapshot();
	const metrics = api.metrics();
	const replay = api.exportReplay();
	snapshot.nested.tick = 99;
	metrics.nested.frames = 99;
	replay.entries[0].tick = 99;
	assert.equal(game.state.nested.tick, 7);
	assert.equal(api.metrics().nested.frames, 4);
	assert.equal(api.exportReplay().entries[0].tick, 1);
});

test("v2 controls and in-memory restart remain compatible", () => {
	const game = new KeliGame();
	const api = new OrosRuntimeApi(game, new EventBus());
	api.start();
	api.turnLeft();
	api.turnRight();
	api.setBoost(true);
	api.pause();
	api.resume();
	const reset = api.restart();
	assert.equal(reset.nested.tick, 0);
	assert.equal("reloading" in reset, false);
	assert.deepEqual(game.calls, ["start", "turn:-1", "turn:1", "boost:true", "pause", "resume", "restart"]);
	assert.throws(() => api.setBoost("yes"), TypeError);
});

test("v3 direct and generic commands route extensions", () => {
	const game = new KeliGame();
	const api = new OrosRuntimeApi(game, new EventBus());
	assert.equal(api.step(3).stepped, 3);
	assert.equal(api.preferences().quality, "auto");
	assert.equal(api.command({ type: "step", count: 2 }).stepped, 2);
	assert.equal(api.command({ type: "preferences", values: { handedness: "left" } }).preferences.handedness, "left");
	assert.equal(api.command({ type: "replay-export" }).schemaVersion, "1.0.0");
	assert.throws(() => api.command({ type: "unknown" }), RangeError);
	assert.throws(() => api.command(null), TypeError);
});

test("API subscriptions receive events and can unsubscribe", () => {
	const bus = new EventBus();
	const api = new OrosRuntimeApi(new KeliGame(), bus);
	let count = 0;
	const stop = api.on("claim", () => count += 1);
	bus.emit({ type: "claim", tick: 2, cells: 3 });
	stop();
	bus.emit({ type: "claim", tick: 3, cells: 4 });
	assert.equal(count, 1);
	assert.equal(api.recentEvents(1)[0].tick, 3);
});
