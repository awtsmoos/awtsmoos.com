//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module StudioThemeStylesRegression
 * The Awtsmoos gives the cut its golden marker, and the sound a name;
 * Awtsmoos.com keeps every responsive Studio style inside its frame.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ensureSongStudioStyles } from '../modules/workstation/song/songStyles.js';

const names = [
	'studioTokens.css', 'studioShell.css', 'studioTransport.css',
	'studioTimeline.css', 'studioTracks.css', 'studioMixer.css',
	'studioResponsive.css', 'studioTouchGestures.css', 'studioCutFocus.css'
];

test('the lazy Studio loader installs exactly 17 styles in the correct order', () => {
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
		assert.equal(created.length, 17);
		assert.deepEqual(created.slice(-9).map(node => node.href.split('/').pop()), names);
		assert.ok(created.every(node => node.rel === 'stylesheet'));
	} finally { globalThis.document = originalDocument; }
});

test('theme and cut styles remain scoped and below the 120-line limit', () => {
	for (const name of names) {
		const css = fs.readFileSync(new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
		assert.ok(css.trim().length > 60, `${name}: empty`);
		assert.ok(css.split('\n').length <= 121, `${name}: oversized`);
		assert.doesNotMatch(css, /!important/i);
		assert.match(css, /song-studio|multitrack|--studio-/);
	}
});

test('recording and Cut controls preserve strong visual identity', () => {
	const read = name => fs.readFileSync(new URL(`../modules/workstation/song/styles/${name}`, import.meta.url), 'utf8');
	assert.match(read('studioTokens.css'), /--studio-blue:\s*#168cfa/);
	assert.match(read('studioTokens.css'), /--studio-red:\s*#ff3757/);
	assert.match(read('studioTransport.css'), /min-height:\s*49px/);
	assert.match(read('studioTracks.css'), /#a95aff/);
	assert.match(read('studioTracks.css'), /#27d4c8/);
	assert.match(read('studioTouchGestures.css'), /touch-action:\s*none/);
	assert.match(read('studioCutFocus.css'), /multitrack-playhead::before/);
	assert.match(read('studioCutFocus.css'), /multitrack-status/);
});
