//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';

/**
 * Runtime contract for the server-first reader.
 * The Awtsmoos gives visible Torah before hidden feature worlds awaken.
 */
const fallbackUrl = 'http://127.0.0.1:8080/heichelos/ikar/series/%D7%AA%D7%A9%D7%A8%D7%99_meluket/post/BH_POST_1766518914575_theRebbe_239?idx=0&sub=0';
const url = process.env.POST_READER_URL || fallbackUrl;
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
let response;
try {
	response = await fetch(url, { signal: controller.signal });
} finally {
	clearTimeout(timeout);
}
assert.equal(response.status, 200, `reader route status ${response.status}`);

const html = await response.text();
const has = token => html.includes(token);
const hasAsset = token => has(token) || has(encodeURIComponent(token));
const criticalPath = '/heichelos/post/styles/reader-controls/critical-shell.css';
const settingsPath = '/heichelos/post/styles/reader-settings.css';
const previewPath = '/heichelos/post/styles/reader-content/server-preview.css';

assert.ok(has('post-reader-localized-context'), 'reader root missing');
assert.ok(hasAsset(`${criticalPath}?v=`), 'versioned critical css missing');
assert.ok(hasAsset('/heichelos/post/styles/passive-reader.css?v=reader-passive-003'));
assert.ok(hasAsset('/heichelos/post/styles/reader-controls/live-template.css?v='));
assert.match(html, /\/heichelos\/post\/postLogic\.js\?v=[^"']+/);
assert.ok(has('id="realPost"'), 'realPost vessel missing');
assert.ok(has('data-awtsmoos-server-preview'), 'server Torah preview missing');
assert.ok(has('awtsmoos-initial-unit-he'), 'server Hebrew units missing');
assert.match(html, /[\u0590-\u05ff]/, 'server Hebrew text missing');
assert.ok(!hasAsset('/heichelos/post/styles/main.css?v='), 'feature graph loaded eagerly');
assert.ok(!hasAsset('/feed/css/anchoredComments.css'), 'comments css loaded eagerly');

const criticalResponse = await fetch(new URL(criticalPath, url));
assert.equal(criticalResponse.status, 200);
const criticalCss = await criticalResponse.text();
assert.match(criticalCss, /\.hidden-details\s*\{[^}]*display:\s*none/s);
assert.match(criticalCss, /--reader-layer-controls:/);
assert.match(criticalCss, /--reader-layer-settings:/);
assert.match(criticalCss, /safe-area-inset-left/);
assert.match(criticalCss, /safe-area-inset-right/);
assert.doesNotMatch(criticalCss, /100vw|100vh/);

const settingsResponse = await fetch(new URL(settingsPath, url));
assert.equal(settingsResponse.status, 200);
const settingsCss = await settingsResponse.text();
assert.match(settingsCss, /settings\.css/);
assert.match(settingsCss, /panels\.css/);

const previewResponse = await fetch(new URL(previewPath, url));
assert.equal(previewResponse.status, 200);
const previewCss = await previewResponse.text();
assert.match(previewCss, /data-awtsmoos-server-preview/);
assert.match(previewCss, /:has\(/);

for (const forbiddenLeak of [
	'thereWasAnAwtsmoosErrorHere',
	'SyntaxError',
	'Unexpected token',
	'<?<script>'
]) {
	assert.ok(!has(forbiddenLeak), `${forbiddenLeak} leaked into rendered HTML`);
}

console.log('B"H postReaderNodeDom.test passed');
