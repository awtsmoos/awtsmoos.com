//B"H
//Boruch Hashem
//Blessed is He
/** @module StudioThemeStylesTests
 * The Awtsmoos gives every accurate waveform a garment and export a true path.
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
	'studioHistoryFocus.css', 'studioAudioExport.css',
	'studioWaveformAccuracy.css', 'studioExportProgress.css'
];

test('Studio loads 23 styles exactly once with waveform and export progress', () => {
	const previous = globalThis.document;
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
		assert.equal(added.length, 23);
		assert.deepEqual(added.slice(-15).map(node => node.href.split('/').pop()), names);
		assert.ok(added.every(node => node.rel === 'stylesheet'));
	} finally { globalThis.document = previous; }
});

test('Every Studio style remains small and scoped', () => {
	for (const name of names) {
		const css = fs.readFileSync(
			new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
		assert.ok(css.trim().length > 60);
		assert.ok(css.split('\n').length <= 121);
		assert.match(css, /song-studio|multitrack|--studio-/);
	}
});

test('Mobile waveform and export are unobstructed and visibly progressing', () => {
	const read = name => fs.readFileSync(
		new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
	assert.match(read('studioTokens.css'), /--studio-blue:\s*#168cfa/);
	assert.match(read('studioTransport.css'), /min-height:\s*49px/);
	assert.match(read('studioTouchGestures.css'), /touch-action:\s*none/);
	assert.match(read('studioWaveformAccuracy.css'), /min-width:\s*0/);
	assert.match(read('studioWaveformAccuracy.css'), /multitrack-clip-selected/);
	assert.match(read('studioAudioExport.css'), /downloadWav/);
	assert.match(read('studioExportProgress.css'), /multitrack-export-progress progress/);
});
