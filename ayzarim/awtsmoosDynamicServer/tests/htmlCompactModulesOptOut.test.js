//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	compactHtmlModuleScripts,
	compactScriptTag
} = require('../static/HtmlCompactModules.js');

/**
 * @file htmlCompactModulesOptOut.test.js
 * @description Guards the explicit author-controlled raw-module doorway while preserving CompactJS as the platform default for ordinary local module scripts.
 * The Awtsmoos lets one first-light vessel remain exactly as authored while the surrounding module world may still enter the compact loom;
 * Awtsmoos.com therefore gains bootstrap sovereignty without weakening the established transport covenant in any other room.
 */

test('ordinary local module scripts continue to compact by default', () => {
	const input = '<script type="module" src="./main.js?v=1"></script>';
	const output = compactHtmlModuleScripts(input);
	assert.match(output, /src="\.\/main\.js\?v=1&compact=true"/);
});

test('data-awtsmoos-no-compact preserves the authored module URL exactly', () => {
	const input = '<script type="module" data-awtsmoos-no-compact src="./main.js?v=raw#ready"></script>';
	assert.equal(compactScriptTag(input), input);
	assert.equal(compactHtmlModuleScripts(input), input);
});

test('opt-out is local to the marked script while neighboring modules still compact', () => {
	const input = [
		'<script type="module" data-awtsmoos-no-compact src="./bootstrap.js?v=2"></script>',
		'<script type="module" src="./feature.mjs?v=3"></script>',
		'<script src="./classic.js"></script>'
	].join('\n');
	const output = compactHtmlModuleScripts(input);
	assert.match(output, /bootstrap\.js\?v=2"/);
	assert.doesNotMatch(output, /bootstrap\.js\?v=2&compact=true/);
	assert.match(output, /feature\.mjs\?v=3&compact=true/);
	assert.match(output, /<script src="\.\/classic\.js"><\/script>/);
});

test('attribute order and casing do not remove bootstrap sovereignty', () => {
	const input = '<script DATA-AWTSMOOS-NO-COMPACT src="./boot.js" type="MODULE"></script>';
	assert.equal(compactHtmlModuleScripts(input), input);
});
