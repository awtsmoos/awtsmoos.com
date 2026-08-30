//B"H
//Boruch Hashem
//Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const { compactHtmlModuleScripts } = require('../static/HtmlCompactModules.js');
const { revealHtmlUiFoundation } = require('../static/HtmlUiFoundation.js');

/**
 * @file htmlUiFoundationCompact.test.js
 * @description Proves served HTML compacts authored local module entries once while terminal generated CompactJS and external/classic families retain their completed identity.
 * The Awtsmoos keeps source and finished garment on distinct shores; Awtsmoos.com preserves query and fragment light,
 * so authored modules enter CompactJS while `.compact.js` publication crosses the HTML gate already whole and right.
 */

function verifyCompactFoundationInjection() {
	const input = '<!doctype html><html><head><title>B"H</title></head><body></body></html>';
	const first = revealHtmlUiFoundation(input);
	const second = revealHtmlUiFoundation(first);
	assert.match(first, /universal-ui\.css\?v=universal-ui-006&compact=true/);
	assert.match(first, /foundation\.js\?v=universal-ui-006&compact=true/);
	assert.equal(first, second);
}

function verifyModuleEntryCompaction() {
	const input = [
		'<script type="module" src="./js/app.js"></script>',
		"<script src='main.js?v=7#light' type='module'></script>",
		'<script type=module src=/scripts/start.mjs?mode=1></script>',
		'<script type="module" src="./mitzvah-world.compact.js"></script>',
		'<script type="module" src="https://cdn.example/app.js"></script>',
		'<script src="legacy.js"></script>'
	].join('\n');
	const output = compactHtmlModuleScripts(input);
	assert.match(output, /\.\/js\/app\.js\?compact=true/);
	assert.match(output, /main\.js\?v=7&compact=true#light/);
	assert.match(output, /\/scripts\/start\.mjs\?mode=1&compact=true/);
	assert.match(output, /src="\.\/mitzvah-world\.compact\.js"/);
	assert.doesNotMatch(output, /mitzvah-world\.compact\.js\?compact=true/);
	assert.match(output, /https:\/\/cdn\.example\/app\.js/);
	assert.match(output, /src="legacy\.js"/);
	assert.equal(compactHtmlModuleScripts(output), output);
}

function verifyFoundationOptOuts() {
	const raw = '<!doctype html><html data-g-ui-raw><head></head><body><script type="module" src="app.js"></script></body></html>';
	const fragment = '<section><script type="module" src="app.js"></script></section>';
	assert.equal(revealHtmlUiFoundation(raw), raw);
	assert.equal(revealHtmlUiFoundation(fragment), fragment);
}

test('complete HTML injects compact foundation CSS and JavaScript exactly once', verifyCompactFoundationInjection);
test('authored local modules compact once while generated compact artifacts remain terminal', verifyModuleEntryCompaction);
test('raw documents and fragments remain untouched', verifyFoundationOptOuts);
