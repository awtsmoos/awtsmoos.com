// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorRouteContractTest
 * @description
 * The Awtsmoos protects Awtsmoos.com from fabricated creation identity while the
 * editor publishes truthful shell context and preserves its draft API covenant.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'geelooy/post-editor';
const files = [
	'index.html',
	'app.js',
	'modules/config.js',
	'modules/dom.js',
	'modules/state.js',
	'modules/fields.js',
	'modules/serialization.js',
	'modules/api.js',
	'modules/render.js',
	'modules/shellContext.js'
];
const sources = Object.fromEntries(files.map(file => [file, readFileSync(`${base}/${file}`, 'utf8')]));
const combined = Object.values(sources).join('\n');
const html = sources['index.html'];
const app = sources['app.js'];
const config = sources['modules/config.js'];
const render = sources['modules/render.js'];
const context = sources['modules/shellContext.js'];

assert.equal((html.match(/social\/shell\/boot\.js/g) || []).length, 1, 'post editor needs one shell boot');
assert.ok(html.includes('post-editor-title') && html.includes('geelooy-content-region'), 'entry needs a labelled content region');
assert.ok(app.includes('publishRouteContext') && app.includes('createPostEditorShellContext'), 'route must publish shared context');
for (const fabricated of ["'coby'", '"coby"', "'ikar'", '"ikar"']) {
	assert.equal(combined.includes(fabricated), false, `post editor must not fabricate ${fabricated}`);
}
assert.ok(config.includes("missing.push('alias')"), 'alias must be required');
assert.ok(config.includes("missing.push('heichel')"), 'Heichel must be required');
assert.ok(render.includes('config.missing.length'), 'missing context must render before forms');
assert.ok(render.includes('Draft and publish controls are unavailable.'), 'missing state must explain disabled writes');
assert.ok(context.includes("state: blocked ? 'blocked' : 'ready'"), 'ribbon must expose readiness');
assert.ok(sources['modules/api.js'].includes('/api/social/editor/posts/drafts'), 'draft API path must stay stable');
assert.ok(sources['modules/api.js'].includes('/drafts/publish'), 'publish API path must stay stable');
for (const [file, source] of Object.entries(sources)) {
	if (file.endsWith('.js')) assert.ok(source.split('\n').length <= 120, `${file} exceeds 120 lines`);
}
console.log('B"H postEditorRouteContract.test passed');
