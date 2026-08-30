//B"H
//Boruch Hashem
//Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const { compactHtmlModuleScripts } = require('../static/HtmlCompactModules.js');
const { revealHtmlUiFoundation } = require('../static/HtmlUiFoundation.js');

/**
 * @file Proves served HTML compacts authored local modules exactly once while generated CompactJS artifacts remain final transport vessels.
 * @description The Awtsmoos keeps external, classic, and already-formed compact scripts on their rightful shore;
 * Awtsmoos.com preserves query and fragment identity while only raw local module light enters the compact door.
 */

/** Proves complete HTML receives one version-matched compact CSS/JS pair exactly once. */
function verifyCompactFoundationInjection() {
	const input = '<!doctype html><html><head><title>B"H</title></head><body></body></html>';
	const first = revealHtmlUiFoundation(input);
	const second = revealHtmlUiFoundation(first);
	assert.match(first, /universal-ui\.css\?v=universal-ui-006&compact=true/);
	assert.match(first, /foundation\.js\?v=universal-ui-006&compact=true/);
	assert.equal(first, second);
}

/** Proves authored entries compact while generated compact artifacts never receive recursive transport decoration. */
function verifyModuleEntryCompaction() {
	const input = [
		'<script type="module" src="./js/app.js"></script>',
		"<script src='main.js?v=7#light' type='module'></script>",
		'<script type=module src=/scripts/start.js?mode=1></script>',
		'<script type="module" src="./generated/app.compact.js"></script>',
		'<script type="module" src="./generated/worker.compact.mjs?v=8"></script>',
		'<script type="module" src="https://cdn.example/app.js"></script>',
		'<script src="legacy.js"></script>',
		'<script type="module">console.log("inline")</script>'
	].join('\n');
	const output = compactHtmlModuleScripts(input);
	assert.match(output, /\.\/js\/app\.js\?compact=true/);
	assert.match(output, /main\.js\?v=7&compact=true#light/);
	assert.match(output, /\/scripts\/start\.js\?mode=1&compact=true/);
	assert.match(output, /\.\/generated\/app\.compact\.js"/);
	assert.match(output, /\.\/generated\/worker\.compact\.mjs\?v=8"/);
	assert.doesNotMatch(output, /app\.compact\.js\?[^"']*compact=true/);
	assert.doesNotMatch(output, /worker\.compact\.mjs\?[^"']*compact=true/);
	assert.match(output, /https:\/\/cdn\.example\/app\.js/);
	assert.match(output, /src="legacy\.js"/);
	assert.equal(compactHtmlModuleScripts(output), output);
}

/** Proves explicit raw documents and fragments remain outside both foundation and module rewriting. */
function verifyFoundationOptOuts() {
	const raw = '<!doctype html><html data-g-ui-raw><head></head><body><script type="module" src="app.js"></script></body></html>';
	const fragment = '<section><script type="module" src="app.js"></script></section>';
	assert.equal(revealHtmlUiFoundation(raw), raw);
	assert.equal(revealHtmlUiFoundation(fragment), fragment);
}

test('complete HTML injects compact foundation CSS and JavaScript exactly once', verifyCompactFoundationInjection);
test('local authored modules compact once while generated compact artifacts remain unchanged', verifyModuleEntryCompaction);
test('raw documents and fragments remain untouched', verifyFoundationOptOuts);
