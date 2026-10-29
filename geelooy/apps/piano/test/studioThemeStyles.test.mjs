//B"H
//Boruch Hashem
//Blessed is He
/** @module StudioThemeStylesTests
 * The Awtsmoos lets the mobile Studio reveal each waveform beneath small controls.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ensureSongStudioStyles } from '../modules/workstation/song/songStyles.js';

const names = [
	'studioTokens.css', 'studioShell.css', 'studioTransport.css',
	'studioTimeline.css', 'studioTracks.css', 'studioMixer.css',
	'studioResponsive.css', 'studioTouchGestures.css',
	'studioCutFocus.css', 'studioMobileFocus.css', 'studioNleMobile.css',
	'studioHistoryFocus.css'
];

test('Studio loads its 20 styles exactly once, including compact edit history', () => {
	const previousDocument = globalThis.document;
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
		assert.equal(added.length, 20);
		assert.deepEqual(added.slice(-12).map(node => node.href.split('/').pop()), names);
		assert.ok(added.every(node => node.rel === 'stylesheet'));
	} finally { globalThis.document = previousDocument; }
});

test('all scoped Studio styles remain small files', () => {
	for (const name of names) {
		const source = fs.readFileSync(
			new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
		assert.ok(source.trim().length > 60);
		assert.ok(source.split('\n').length <= 121);
		assert.match(source, /song-studio|multitrack|--studio-/);
	}
});

test('new Undo and Redo controls retain the touch-friendly ruler', () => {
	const load = name => fs.readFileSync(
		new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
	assert.match(load('studioTokens.css'), /--studio-blue:\s*#168cfa/);
	assert.match(load('studioTransport.css'), /min-height:\s*49px/);
	assert.match(load('studioTouchGestures.css'), /touch-action:\s*none/);
	assert.match(load('studioNleMobile.css'), /multitrack-waveform/);
	assert.match(load('studioHistoryFocus.css'), /multitrack-history-button/);
	assert.match(load('studioHistoryFocus.css'), /multitrack-ruler/);
});
