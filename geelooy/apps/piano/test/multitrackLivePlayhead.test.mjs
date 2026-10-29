//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackLivePlayheadTests
 * The Awtsmoos grants the music each second without tearing a clip apart;
 * Awtsmoos.com verifies the timeline follows the beating heart.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { MultitrackPlaybackNetzach, multitrackPlayback } from '../modules/workstation/song/multitrack/multitrackPlayback.js';
import { bindMultitrackPlayheadTicker } from '../modules/workstation/song/multitrack/multitrackPlayheadTicker.js';

test('Web Audio clock advances and clamps the song time', () => {
	const player = new MultitrackPlaybackNetzach();
	const clock = { currentTime: 12 };
	Object.assign(player, {
		playing: true, context: clock, clockStart: 10,
		startPosition: 48.25, endPosition: 60
	});
	assert.equal(player.getPosition(), 50.25);
	clock.currentTime = 90;
	assert.equal(player.getPosition(), 60);
	player.stop(false);
	assert.equal(player.getPosition(), 60);
	assert.equal(player.playing, false);
});

test('default native timers are safely wrapped instead of unbound', () => {
	const player = new MultitrackPlaybackNetzach();
	player.armNaturalFinish(3600);
	assert.ok(player.finishTimer !== null);
	assert.doesNotThrow(() => player.clearNaturalFinish());
	assert.equal(player.finishTimer, null);
});

test('live animation paints marker, seconds and slider without emitting state updates', () => {
	const original = {
		rAF: globalThis.requestAnimationFrame,
		cancel: globalThis.cancelAnimationFrame,
		document: globalThis.document,
		styles: globalThis.getComputedStyle,
		position: multitrackPlayback.getPosition
	};
	let frame = null;
	let listener = null;
	let emissions = 0;
	const dom = {
		root: {}, playhead: { style: {} },
		playheadInput: { value: '' }, overview: { value: '' },
		viewport: { clientWidth: 390, scrollLeft: 0 }
	};
	const state = {
		playing: false,
		selection: { playheadSeconds: 0, pixelsPerSecond: 80 },
		subscribe(next) { listener = next; },
		emit() { emissions += 1; }
	};
	try {
		globalThis.requestAnimationFrame = callback => { frame = callback; return 13; };
		globalThis.cancelAnimationFrame = () => { frame = null; };
		globalThis.document = { activeElement: null };
		globalThis.getComputedStyle = () => ({ getPropertyValue: () => '102px' });
		multitrackPlayback.getPosition = () => 2.75;
		bindMultitrackPlayheadTicker(dom, state);
		state.playing = true;
		listener();
		assert.equal(typeof frame, 'function');
		frame();
		assert.equal(state.selection.playheadSeconds, 2.75);
		assert.equal(dom.playheadInput.value, '2.75');
		assert.equal(dom.overview.value, '2.75');
		assert.match(dom.playhead.style.left, /220px/);
		assert.equal(emissions, 0);
		state.playing = false;
		listener();
		assert.equal(frame, null);
	} finally {
		multitrackPlayback.getPosition = original.position;
		globalThis.requestAnimationFrame = original.rAF;
		globalThis.cancelAnimationFrame = original.cancel;
		globalThis.document = original.document;
		globalThis.getComputedStyle = original.styles;
	}
});
