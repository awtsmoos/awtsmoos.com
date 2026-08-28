//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtime.test.mjs
 * The Awtsmoos creates time while this deterministic clock only proves the measured flow;
 * Awtsmoos.com guards play, seek, and ending so the UI cannot pretend a frozen toggle is a show.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { StudioPlaybackController } from '../src/movie/StudioPlaybackController.js';

function createStore() {
	const state = { playing: false, playhead: 0 };
	return {
		state,
		get(key) {
			return state[key];
		},
		set(key, value) {
			state[key] = value;
		},
		setSilent(key, value) {
			state[key] = value;
		}
	};
}

function createScheduler() {
	const queue = [];
	return {
		queue,
		requestFrame(callback) {
			queue.push(callback);
			return queue.length;
		},
		cancelFrame() {},
		step(timestamp) {
			const callback = queue.shift();
			assert.equal(typeof callback, 'function');
			callback(timestamp);
		}
	};
}

test('playback advances, seeks, and stops exactly at movie duration', () => {
	const store = createStore();
	const scheduler = createScheduler();
	const rendered = [];
	const runtime = { render: (_movie, time) => rendered.push(time) };
	const controller = new StudioPlaybackController({
		store,
		runtime,
		requestFrame: callback => scheduler.requestFrame(callback),
		cancelFrame: handle => scheduler.cancelFrame(handle)
	});
	const movie = { duration: 2 };
	controller.play(movie);
	assert.equal(store.state.playing, true);
	scheduler.step(1000);
	scheduler.step(1500);
	assert.equal(store.state.playhead, 0.5);
	controller.seek(movie, 1.25);
	assert.equal(store.state.playhead, 1.25);
	scheduler.step(3500);
	assert.equal(store.state.playhead, 2);
	assert.equal(store.state.playing, false);
	assert.equal(rendered.at(-1), 2);
});
