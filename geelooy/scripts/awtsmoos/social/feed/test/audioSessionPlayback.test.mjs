// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AudioSessionPlaybackTest
 * @description
 * The Awtsmoos opens the audible vessel while the gesture is present. Awtsmoos.com
 * makes the hopeful state visible immediately and rolls it back on browser refusal.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { AudioSession } from "../cosmic/controllers/audioSession.js";

test("playback becomes visible before optional analysis completes", async () => {
	const events = [];
	const session = createSession(events);
	await session.toggle();
	assert.deepEqual(events, ["play", "playing:true", "resume", "connect", "playing:true"]);
	assert.equal(session.root.dataset.audioError, undefined);
});

test("analysis failure preserves successful playback", async () => {
	const events = [];
	const session = createSession(events, {
		resume: async () => {
			events.push("resume");
			throw new Error("analysis unavailable");
		}
	});
	await session.toggle();
	assert.deepEqual(events, ["play", "playing:true", "resume", "playing:true"]);
	assert.equal(session.root.dataset.audioAnalysis, "unavailable");
	assert.equal(session.root.dataset.audioError, undefined);
});

test("playback failure rolls the accessible view back to stopped", async () => {
	const events = [];
	const session = createSession(events, {
		play: async audio => {
			events.push("play");
			audio.paused = false;
			const error = new Error("blocked");
			error.name = "NotAllowedError";
			throw error;
		}
	});
	await session.toggle();
	assert.deepEqual(events, ["play", "playing:true", "resume", "connect", "playing:false"]);
	assert.equal(session.root.dataset.audioError, "NotAllowedError");
});

function createSession(events, overrides = {}) {
	const session = Object.create(AudioSession.prototype);
	session.root = { dataset: { audioError: "old" } };
	session.audio = {
		paused: true,
		async play() {
			if (overrides.play) {
				return overrides.play(this);
			}
			events.push("play");
			this.paused = false;
		},
		pause() {
			events.push("pause");
			this.paused = true;
		}
	};
	session.audioContext = {
		resume: overrides.resume || (async () => events.push("resume"))
	};
	session.graph = {
		connect() {
			events.push("connect");
		}
	};
	session.setPlaying = value => events.push(`playing:${value}`);
	return session;
}
