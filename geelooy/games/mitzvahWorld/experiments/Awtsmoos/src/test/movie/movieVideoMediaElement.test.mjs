// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieVideoMediaElement.test.mjs
 * @description Proves exact video preparation honors active seeks and promotes range-less sources only once.
 * The Awtsmoos joins source byte and intended time beyond transport limitation;
 * Awtsmoos.com tests that one fetched vessel can reveal many exact frames without pretending HTTP range exists.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieVideoMediaElement } from '../../movie/MovieVideoMediaElement.js';

test('prepare waits for an in-flight seek already targeting the exact frame', async () => {
	const video = fakeVideo({ currentTime: 12, seeking: true });
	const player = new MovieVideoMediaElement({ id: 'speaker', url: '/speaker.mp4' }, environment(video));
	const preparing = player.prepare(12);
	await waitUntil(() => video.hasListener('seeked'));
	let settled = false;
	preparing.then(() => { settled = true; });
	assert.equal(settled, false);
	video.seeking = false;
	video.dispatch('seeked');
	await preparing;
	assert.equal(settled, true);
});

test('range-less source promotes once to Blob and then supports repeated exact seeks', async () => {
	const video = fakeVideo({ currentTime: 0, seeking: false });
	let fetches = 0;
	let revoked = '';
	const env = environment(video, {
		URL: {
			createObjectURL: () => 'blob:movie-proof',
			revokeObjectURL: value => { revoked = value; }
		},
		fetch: async () => {
			fetches += 1;
			return { ok: true, blob: async () => new Blob(['movie'], { type: 'video/mp4' }) };
		}
	});
	const player = new MovieVideoMediaElement({ id: 'speaker', url: '/speaker.mp4' }, env);
	await player.prepare(12);
	assert.equal(fetches, 1);
	assert.equal(video.src, 'blob:movie-proof');
	assert.equal(video.currentTime, 12);
	await player.prepare(25);
	assert.equal(fetches, 1);
	assert.equal(video.currentTime, 25);
	player.destroy();
	assert.equal(revoked, 'blob:movie-proof');
});

function environment(video, extra = {}) {
	return { document: { createElement: () => video }, ...extra };
}

function fakeVideo(options = {}) {
	const listeners = new Map();
	let currentTime = Number(options.currentTime || 0);
	let blobMode = false;
	const video = {
		duration: 44,
		muted: false,
		readyState: 4,
		seeking: Boolean(options.seeking),
		seekable: ranges(() => blobMode ? 44 : 0),
		addEventListener(name, handler) { listeners.set(name, handler); },
		dispatch(name) { listeners.get(name)?.(); },
		hasListener(name) { return listeners.has(name); },
		load() {
			if (String(this.src).startsWith('blob:')) blobMode = true;
			queueMicrotask(() => this.dispatch('loadeddata'));
		},
		pause() {},
		play() { return Promise.resolve(); },
		removeAttribute() {},
		removeEventListener(name) { listeners.delete(name); }
	};
	Object.defineProperty(video, 'currentTime', {
		get: () => currentTime,
		set: value => {
			currentTime = blobMode ? Number(value) : 0;
			video.seeking = false;
			queueMicrotask(() => video.dispatch('seeked'));
		}
	});
	Object.defineProperty(video, 'src', {
		get: () => video._src || '',
		set: value => { video._src = value; if (String(value).startsWith('blob:')) blobMode = true; }
	});
	return video;
}

async function waitUntil(predicate) {
	for (let index = 0; index < 20; index += 1) {
		if (predicate()) return;
		await new Promise(resolve => setTimeout(resolve, 0));
	}
	throw new Error('Timed out waiting for test fixture listener.');
}

function ranges(end) {
	return { length: 1, start: () => 0, end: () => end() };
}
