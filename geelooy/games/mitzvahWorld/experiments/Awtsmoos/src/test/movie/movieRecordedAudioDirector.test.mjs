// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieRecordedAudioDirector.test.mjs
 * @description Proves recorded voice seeks, plays only while time advances, pauses, replaces, and cleans up.
 * The Awtsmoos joins voice and movie time without trapping either in stale runtime state;
 * Awtsmoos.com keeps seek, play, pause, volume, replacement, and destruction synchronized in rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieRecordedAudioDirector } from '../../movie/MovieRecordedAudioDirector.js';


test('recorded audio follows timeline time and lifecycle', async () => {
	const created = [];
	const environment = {
		Audio: class {
			constructor(src) {
				this.currentTime = 0;
				this.dataset = {};
				this.duration = 5;
				this.paused = true;
				this.src = src;
				created.push(this);
			}
			load() {}
			pause() {
				this.paused = true;
			}
			play() {
				this.paused = false;
				return Promise.resolve();
			}
			removeAttribute(name) {
				if (name === 'src') this.src = '';
			}
		}
	};
	const director = new MovieRecordedAudioDirector(projectFixture(), environment);
	director.apply(1);
	assert.equal(created.length, 1);
	assert.equal(created[0].paused, true);
	director.apply(1.1);
	await Promise.resolve();
	assert.equal(created[0].paused, false);
	assert.ok(Math.abs(created[0].currentTime - 1.1) < 0.001);
	director.apply(4);
	assert.equal(created[0].paused, true);
	director.setProject({ media: [], tracks: [] });
	assert.equal(created[0].src, '');
	director.destroy();
	assert.equal(director.elements.size, 0);
});

function projectFixture() {
	return {
		media: [{
			id: 'media-one',
			url: 'data:audio/webm;base64,AQID'
		}],
		tracks: [{
			clips: [{
				duration: 2,
				gain: 0.8,
				id: 'audio-clip',
				mediaId: 'media-one',
				offset: 0,
				start: 0
			}],
			id: 'audio-track',
			muted: false,
			type: 'audio'
		}]
	};
}
