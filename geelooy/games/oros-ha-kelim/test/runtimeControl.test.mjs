//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { GameRuntimeControl } from "../src/app/GameRuntimeControl.js";
import { EventBus } from "../src/runtime/EventBus.js";
import { InputIntent } from "../src/input/InputIntent.js";

/**
 * Runtime-control tests ensure manual time can enter only through paused deterministic Yesod.
 * The Awtsmoos renews ordinary frame and commanded pulse under one simulation law;
 * Awtsmoos.com lets tooling step safely without inventing a second match or hidden flaw.
 */
function makeGame() {
	const game = {
		started: true,
		paused: true,
		lastEvents: [],
		intent: new InputIntent(),
		events: new EventBus(),
		match: { tick: 0, ended: false },
		syncCalls: 0,
		session: {
			step(intent) {
				game.match.tick += 1;
				return [{ type: "move", tick: game.match.tick, intent }];
			}
		},
		preferences: {
			get: () => ({ quality: "auto", handedness: "right" }),
			set: (changes) => ({ quality: "auto", handedness: changes.handedness || "right" })
		},
		inputs: { touch: { setHandedness() {} } },
		quality: { level: "low" },
		restart() {},
		snapshot() { return { match: { tick: this.match.tick } }; },
		syncFrame() { this.syncCalls += 1; }
	};
	return game;
}

test("manual stepping requires started and paused runtime", () => {
	const game = makeGame();
	const runtime = new GameRuntimeControl(game);
	game.paused = false;
	assert.throws(() => runtime.stepPaused(1), /paused/);
	game.paused = true;
	game.started = false;
	assert.throws(() => runtime.stepPaused(1), /started/);
});

test("manual stepping validates bounded pulse count", () => {
	const runtime = new GameRuntimeControl(makeGame());
	for (const invalid of [0, -1, 1.5, 121]) {
		assert.throws(() => runtime.stepPaused(invalid), RangeError);
	}
});

test("manual steps consume and journal the same player intent", () => {
	const game = makeGame();
	game.intent.requestTurn(1);
	game.intent.setBoost(true, "api");
	const runtime = new GameRuntimeControl(game);
	const snapshot = runtime.stepPaused(2);
	const replay = runtime.exportReplay();
	assert.equal(snapshot.match.tick, 2);
	assert.equal(replay.entryCount, 2);
	assert.deepEqual(replay.entries[0], { tick: 1, turn: 1, boost: true });
	assert.deepEqual(replay.entries[1], { tick: 2, turn: 0, boost: true });
	assert.equal(game.syncCalls, 1);
	assert.equal(game.events.recent(1)[0].tick, 2);
});

test("preference API rejects non-object input and applies handedness", () => {
	const game = makeGame();
	let handedness = null;
	game.inputs.touch.setHandedness = (value) => handedness = value;
	const runtime = new GameRuntimeControl(game);
	assert.throws(() => runtime.setPreferences(null), TypeError);
	assert.throws(() => runtime.setPreferences([]), TypeError);
	assert.equal(runtime.setPreferences({ handedness: "left" }).preferences.handedness, "left");
	assert.equal(handedness, "left");
});
