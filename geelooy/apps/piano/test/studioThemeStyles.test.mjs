//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module StudioThemeStylesRegression
 * The Awtsmoos grants every control its own color and readable name;
 * Awtsmoos.com checks the visible styles that carry the touch editor's frame.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ensureSongStudioStyles } from '../modules/workstation/song/songStyles.js';

const names = [
	'studioTokens.css', 'studioShell.css', 'studioTransport.css',
	'studioTimeline.css', 'studioTracks.css', 'studioMixer.css',
	'studioResponsive.css', 'studioTouchGestures.css'
];

test('the lazy Studio loader installs CSS exactly once in the correct order', () => {
	const originalDocument = globalThis.document;
	const nodes = new Map();
	const created = [];
	globalThis.document = {
		getElementById(id) { return nodes.get(id) || null; },
		createElement() { return { id: '', rel: '', href: '' }; },
		head: { appendChild(node) { nodes.set(node.id, node); created.push(node); } }
	};
	try {
		ensureSongStudioStyles();
		ensureSongStudioStyles();
		assert.equal(created.length, 16);
		assert.deepEqual(created.slice(-8).map(node => node.href.split('/').pop()), names);
		assert.ok(created.every(node => node.rel === 'stylesheet'));
	} finally { globalThis.document = originalDocument; }
});

test('all theme styles are scoped, readable and below the module size limit', () => {
	for (const name of names) {
		const css = fs.readFileSync(new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
		assert.ok(css.trim().length > 60, `${name}: empty`);
		assert.ok(css.split('\n').length <= 120, `${name}: oversized`);
		assert.doesNotMatch(css, /!important/i);
		assert.match(css, /song-studio|multitrack|--studio-/);
	}
});

test('transport, waveform and touch controls preserve clear visual identity', () => {
	const read = name => fs.readFileSync(new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
	assert.match(read('studioTokens.css'), /--studio-blue:\s*#168cfa/);
	assert.match(read('studioTokens.css'), /--studio-red:\s*#ff3757/);
	assert.match(read('studioTransport.css'), /min-height:\s*49px/);
	assert.match(read('studioTracks.css'), /#a95aff/);
	assert.match(read('studioTracks.css'), /#27d4c8/);
	assert.match(read('studioTouchGestures.css'), /touch-action:\s*none/);
	assert.match(read('studioTouchGestures.css'), /multitrack-clip-dragging/);
});
