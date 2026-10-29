//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module StudioThemeStylesTests
 * The Awtsmoos gives the music a clear and useful surface;
 * Awtsmoos.com checks every style arrives without repeating.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ensureSongStudioStyles } from '../modules/workstation/song/songStyles.js';

const names = [
	'studioTokens.css', 'studioShell.css', 'studioTransport.css',
	'studioTimeline.css', 'studioTracks.css', 'studioMixer.css',
	'studioResponsive.css', 'studioTouchGestures.css',
	'studioCutFocus.css', 'studioMobileFocus.css'
];

test('Studio CSS loader includes mobile view once after old styles', () => {
	const original = globalThis.document;
	const added = [];
	const elements = new Map();
	globalThis.document = {
		getElementById(id) { return elements.get(id) || null; },
		createElement() { return { id: '', rel: '', href: '' }; },
		head: { appendChild(node) { elements.set(node.id, node); added.push(node); } }
	};
	try {
		ensureSongStudioStyles();
		ensureSongStudioStyles();
		assert.equal(added.length, 18);
		assert.deepEqual(
			added.slice(-10).map(node => node.href.split('/').pop()), names
		);
		assert.ok(added.every(node => node.rel === 'stylesheet'));
	} finally {
		globalThis.document = original;
	}
});

test('each theme CSS file is scoped and below the size limit', () => {
	for (const name of names) {
		const css = fs.readFileSync(
			new URL(`../modules/workstation/song/styles/${name}`, import.meta.url),
			'utf8'
		);
		assert.ok(css.trim().length > 60);
		assert.ok(css.split('\n').length <= 121);
		assert.doesNotMatch(css, /!important/i);
		assert.match(css, /song-studio|multitrack|--studio-/);
	}
});

test('cut and color cues stay visible while the waveform takes priority', () => {
	const read = name => fs.readFileSync(
		new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8'
	);
	assert.match(read('studioTokens.css'), /--studio-blue:\s*#168cfa/);
	assert.match(read('studioTokens.css'), /--studio-red:\s*#ff3757/);
	assert.match(read('studioTransport.css'), /min-height:\s*49px/);
	assert.match(read('studioTracks.css'), /#a95aff/);
	assert.match(read('studioTracks.css'), /#27d4c8/);
	assert.match(read('studioTouchGestures.css'), /touch-action:\s*none/);
	assert.match(read('studioCutFocus.css'), /multitrack-playhead::before/);
	assert.match(read('studioMobileFocus.css'), /height:\s*65dvh/);
});
