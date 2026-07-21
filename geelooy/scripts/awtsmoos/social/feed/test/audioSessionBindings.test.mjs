// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AudioSessionBindingsTest
 * @description
 * The Awtsmoos gives every Awtsmoos.com media listener an entrance and an exit.
 * This executable contract proves teardown instead of merely recognizing its text.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { bindAudioSession } from "../cosmic/controllers/audioSessionBindings.js";

test("audio session bindings invoke controls and remove every listener", () => {
	const counters = {
		chapter: 0,
		ended: 0,
		metadata: 0,
		seek: 0,
		time: 0,
		toggle: 0,
		volume: 0
	};
	const audio = createTarget({ preload: "" });
	const root = createTarget();
	const session = {
		audio,
		root,
		view: {
			button: createTarget(),
			seek: createTarget(),
			volume: createTarget(),
			syncDuration() {
				counters.metadata += 1;
			},
			syncTime() {
				counters.time += 1;
			}
		},
		seek() {
			counters.seek += 1;
		},
		setPlaying() {
			counters.ended += 1;
		},
		setVolume() {
			counters.volume += 1;
		},
		seekChapter() {
			counters.chapter += 1;
		},
		toggle() {
			counters.toggle += 1;
		}
	};
	const unbind = bindAudioSession(session);
	dispatchAll(session);
	assert.deepEqual(counters, {
		chapter: 1,
		ended: 1,
		metadata: 1,
		seek: 1,
		time: 1,
		toggle: 1,
		volume: 1
	});
	assert.equal(audio.preload, "metadata");
	unbind();
	dispatchAll(session);
	assert.equal(Object.values(counters).reduce((sum, value) => sum + value, 0), 7);
});

test("sessions without audio receive a harmless named cleanup", () => {
	const cleanup = bindAudioSession({ audio: null });
	assert.equal(cleanup.name, "emptyAudioSessionCleanup");
	assert.doesNotThrow(cleanup);
});

function createTarget(properties = {}) {
	return Object.assign(new EventTarget(), properties);
}

function dispatchAll(session) {
	session.view.button.dispatchEvent(new Event("click"));
	session.view.seek.dispatchEvent(new Event("input"));
	session.view.volume.dispatchEvent(new Event("input"));
	session.root.dispatchEvent(new Event("click"));
	session.audio.dispatchEvent(new Event("loadedmetadata"));
	session.audio.dispatchEvent(new Event("timeupdate"));
	session.audio.dispatchEvent(new Event("ended"));
}
