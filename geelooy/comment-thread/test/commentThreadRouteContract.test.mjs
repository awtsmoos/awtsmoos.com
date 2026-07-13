// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadRouteContractTest
 * @description
 * The Awtsmoos protects Awtsmoos.com from fabricated conversation coordinates,
 * separating readable post truth from explicit writing identity in page and ribbon.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'geelooy/comment-thread';
const files = [
	'index.html',
	'app.js',
	'modules/config.js',
	'modules/dom.js',
	'modules/api.js',
	'modules/media.js',
	'modules/composer.js',
	'modules/tree.js',
	'modules/render.js',
	'modules/shellContext.js'
];
const sources = Object.fromEntries(files.map(file => [file, readFileSync(`${base}/${file}`, 'utf8')]));
const combined = Object.values(sources).join('\n');
const html = sources['index.html'];
const app = sources['app.js'];
const config = sources['modules/config.js'];
const api = sources['modules/api.js'];
const render = sources['modules/render.js'];
const context = sources['modules/shellContext.js'];

assert.equal((html.match(/social\/shell\/boot\.js/g) || []).length, 1, 'comment route needs one shell boot');
assert.ok(html.includes('comment-thread-title') && html.includes('geelooy-content-region'), 'entry needs a labelled region');
assert.ok(app.includes('publishRouteContext') && app.includes('createCommentThreadShellContext'), 'route must publish context');
for (const fabricated of ['coby', 'ikar', "|| 'post'", '|| "post"']) {
	assert.equal(combined.includes(fabricated), false, `comment route must not fabricate ${fabricated}`);
}
assert.ok(config.includes("missingRead.push('heichel')"), 'Heichel is required to read');
assert.ok(config.includes("missingRead.push('post')"), 'post is required to read');
assert.ok(config.includes('Boolean(aliasId)'), 'alias is separately required to write');
assert.ok(render.includes('if (this.config.missingRead.length)'), 'missing read context must stop loading');
assert.ok(render.includes('No comment request was sent.'), 'missing state must state network honesty');
assert.ok(render.includes('this.config.canWrite'), 'composer visibility must follow write context');
assert.ok(context.includes("config.canWrite ? 'writable' : 'read-only'"), 'ribbon must expose write state');
assert.ok(api.includes('/comment-tree') && api.includes('/replies'), 'comment endpoints must stay stable');
for (const [file, source] of Object.entries(sources)) {
	if (file.endsWith('.js')) assert.ok(source.split('\n').length <= 120, `${file} exceeds 120 lines`);
}
console.log('B"H commentThreadRouteContract.test passed');
