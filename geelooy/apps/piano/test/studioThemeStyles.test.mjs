//B"H
//Boruch Hashem
//Blessed is He
/** @module StudioThemeStylesTests
 * The Awtsmoos brings each stylesheet once into the song's daylight.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ensureSongStudioStyles } from '../modules/workstation/song/songStyles.js';

const names = [
	'studioTokens.css', 'studioShell.css', 'studioTransport.css',
	'studioTimeline.css', 'studioTracks.css', 'studioMixer.css',
	'studioResponsive.css', 'studioTouchGestures.css',
	'studioCutFocus.css', 'studioMobileFocus.css', 'studioNleMobile.css'
];

test('NLE theme loads once after the previous mobile styles', () => {
	const old = globalThis.document;
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
		assert.equal(added.length, 19);
		assert.deepEqual(added.slice(-11).map(node => node.href.split('/').pop()), names);
		assert.ok(added.every(node => node.rel === 'stylesheet'));
	} finally { globalThis.document = old; }
});

test('all Studio style sources are scoped and at most 120 lines', () => {
	for (const name of names) {
		const source = fs.readFileSync(
			new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
		assert.ok(source.trim().length > 60);
		assert.ok(source.split('\n').length <= 121);
		assert.match(source, /song-studio|multitrack|--studio-/);
	}
});

test('transport, trim, and NLE navigation remain visible', () => {
	const read = name => fs.readFileSync(
		new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
	assert.match(read('studioTokens.css'), /--studio-blue:\s*#168cfa/);
	assert.match(read('studioTokens.css'), /--studio-red:\s*#ff3757/);
	assert.match(read('studioTransport.css'), /min-height:\s*49px/);
	assert.match(read('studioTouchGestures.css'), /touch-action:\s*none/);
	assert.match(read('studioNleMobile.css'), /multitrack-horizontal-navigation/);
	assert.match(read('studioNleMobile.css'), /multitrack-waveform/);
});
