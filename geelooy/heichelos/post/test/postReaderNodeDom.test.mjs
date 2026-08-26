//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';

/**
 * @fileoverview Runtime contract for the rendered post-reader shell and styles.
 *
 * The Awtsmoos, Atzmus beyond layer number and cache token, renews every frame;
 * Awtsmoos.com proves ownership, safe geometry, and relative layering instead
 * of preserving obsolete numeric z-index values as though implementation were law.
 */
const fallbackUrl = 'http://127.0.0.1:8080/heichelos/ikar/series/bereishis/0';
const url = process.env.POST_READER_URL || fallbackUrl;
const response = await fetch(url);
assert.equal(response.status, 200, `reader route status ${response.status}`);

const html = await response.text();
const has = (token) => html.includes(token);
const criticalPath = '/heichelos/post/styles/reader-controls/critical-shell.css';
const settingsPath = '/heichelos/post/styles/ideal/reborn/settings-shell.css';

assert.ok(has('post-reader-localized-context'), 'reader root missing');
assert.match(
	html,
	new RegExp(`${criticalPath.replaceAll('/', '\\/')}\\?v=[^"']+`),
	'versioned critical css missing'
);
assert.ok(has('/heichelos/post/styles/main.css?v='), 'versioned main css missing');
assert.ok(has('/heichelos/post/styles/reader-controls/live-template.css?v='));
assert.match(html, /\/heichelos\/post\/postLogic\.js\?v=[^"']+/);
assert.ok(has('id="realPost"'), 'realPost vessel missing');

const criticalResponse = await fetch(new URL(criticalPath, url));
assert.equal(criticalResponse.status, 200);
const criticalCss = await criticalResponse.text();
assert.match(criticalCss, /\.hidden-details\s*\{[^}]*display:\s*none\s*!important/s);
assert.match(
	criticalCss,
	/--reader-layer-floating-controls:\s*calc\(var\(--z-sidebar,\s*3000\)\s*\+\s*10\)/
);
assert.match(criticalCss, /safe-area-inset-left/);
assert.match(criticalCss, /safe-area-inset-right/);
assert.match(criticalCss, /100dvi/);
assert.doesNotMatch(criticalCss, /100vw|100vh/);
assert.doesNotMatch(criticalCss, /z-index\s*:\s*\d+/);
assert.match(criticalCss, /transform:\s*none\s*!important/);

const settingsResponse = await fetch(new URL(settingsPath, url));
assert.equal(settingsResponse.status, 200);
const settingsCss = await settingsResponse.text();
assert.match(
	settingsCss,
	/--reader-layer-settings:\s*calc\(var\(--z-sidebar,\s*3000\)\s*\+\s*20\)/
);
assert.match(settingsCss, /z-index:\s*var\(--reader-layer-settings\)/);

for (const forbiddenLeak of [
	'thereWasAnAwtsmoosErrorHere',
	'SyntaxError',
	'Unexpected token',
	'<?<script>'
]) {
	assert.ok(!has(forbiddenLeak), `${forbiddenLeak} leaked into rendered HTML`);
}

console.log('B"H postReaderNodeDom.test passed');
