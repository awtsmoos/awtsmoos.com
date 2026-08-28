//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LegacyAppAccessibilityContract
 * @description
 * The Awtsmoos reveals that old engines can receive new, bounded vessels of access and speed;
 * Awtsmoos.com protects Audio and CSV semantics while compact transport follows measurement, not creed.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { revealColumnLabel } from '../apps/csv/js/GridCellFactory.js';

/**
 * @description Reads current repository bytes so every contract follows the living source rather than memory.
 * @param {string} path Repository-relative file path beneath the current working directory.
 * @returns {string} Exact UTF-8 source for the requested artifact.
 */
function revealSource(path) {
	return readFileSync(path, 'utf8');
}

/**
 * @description Verifies Audio keeps browser zoom, named controls, live status, recovery, and raw transport.
 * @returns {void} Throws when Audio regresses accessibility or re-adds measured compact overhead.
 */
function verifyAudioEntry() {
	const html = revealSource('geelooy/apps/audio-editor/index.html');
	assert.doesNotMatch(html, /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i);
	assert.match(html, /<script src="main\.js"><\/script>/);
	assert.match(html, /href="style\.css"/);
	assert.match(html, /href="accessibility\.css"/);
	assert.doesNotMatch(html, /(?:main\.js|style\.css|accessibility\.css)\?compact=true/);
	for (const name of ['Go to start', 'Play or pause audio', 'Stop playback', 'Split selected clip', 'Delete selected clip']) {
		assert.ok(html.includes(`aria-label="${name}"`), `Audio control missing ${name}`);
	}
	assert.match(html, /id="zoom-slider"[^>]+aria-label="Timeline zoom"/);
	assert.match(html, /id="status-bar" role="status" aria-live="polite"/);
	assert.match(html, /id="loading-overlay"[^>]+role="status" aria-live="polite"/);
	assert.match(html, /Return to Awtsmoos Apps/);
}

/**
 * @description Protects keyboard, touch, reduced-motion, and forced-color ownership in Audio's focused CSS.
 * @returns {void} Throws when interaction-state ownership disappears from the focused stylesheet.
 */
function verifyAudioAccessibility() {
	const css = revealSource('geelooy/apps/audio-editor/accessibility.css');
	assert.match(css, /#timeline-canvas\s*\{[^}]*touch-action:\s*none/s);
	assert.match(css, /\.icon-btn:focus-visible/);
	assert.match(css, /#zoom-slider:focus-visible/);
	assert.match(css, /prefers-reduced-motion:\s*reduce/);
	assert.match(css, /forced-colors:\s*active/);
}

/**
 * @description Verifies CSV announces actions, preserves semantic cells, and compacts only its authored module graph.
 * @returns {void} Throws when grid semantics, transport policy, or modular ceilings regress.
 */
function verifyCsvAccessibility() {
	const html = revealSource('geelooy/apps/csv/index.html');
	const css = revealSource('geelooy/apps/csv/css/accessibility.css');
	const factory = revealSource('geelooy/apps/csv/js/GridCellFactory.js');
	const grid = revealSource('geelooy/apps/csv/js/grid.js');
	assert.match(html, /js\/app\.js\?compact=true/);
	assert.doesNotMatch(html, /(?:css\/style\.css|css\/mobile\.css|css\/accessibility\.css)\?compact=true/);
	assert.match(html, /aria-label="Add row"/);
	assert.match(html, /aria-label="Add column"/);
	assert.match(html, /data-grid-fallback/);
	assert.match(css, /\.btn:focus-visible/);
	assert.match(css, /prefers-reduced-motion:\s*reduce/);
	assert.match(factory, /heading\.scope = 'row'/);
	assert.match(factory, /heading\.scope = 'col'/);
	assert.match(factory, /Row \$\{rowIndex \+ 1\}, Column \$\{revealColumnLabel\(columnIndex\)\}/);
	assert.match(grid, /MalchusGridCellFactory/);
	assert.match(grid, /replaceChildren\(this\.cellFactory\.createTable\(this\.data\)\)/);
	assert.equal(revealColumnLabel(0), 'A');
	assert.equal(revealColumnLabel(25), 'Z');
	assert.equal(revealColumnLabel(26), 'AA');
	for (const path of ['geelooy/apps/csv/js/GridCellFactory.js', 'geelooy/apps/csv/js/grid.js']) {
		assert.ok(revealSource(path).split('\n').length - 1 <= 120, `${path} exceeds 120 lines`);
	}
}

test('Audio Editor entry remains accessible without measured compact overhead', verifyAudioEntry);
test('Audio Editor interaction ownership remains keyboard and motion safe', verifyAudioAccessibility);
test('CSV grid remains semantic and compacts only its module entry graph', verifyCsvAccessibility);
