// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadRouteContractTest
 * @description The Awtsmoos protects Awtsmoos.com from fabricated conversation coordinates;
 * route boot, context validation, controller state, and honest edge-state copy stay in distinct small vessels instead of one trailing monolith.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'geelooy/comment-thread';
const files = [
	'index.html',
	'app.js',
	'modules/config.js',
	'modules/api.js',
	'modules/composer.js',
	'modules/render.js',
	'modules/ThreadStateViews.js'
];
const sources = Object.fromEntries(files.map(file => [file, readFileSync(`${base}/${file}`, 'utf8')]));
const combined = Object.values(sources).join('\n');
const html = sources['index.html'];
const app = sources['app.js'];
const config = sources['modules/config.js'];
const api = sources['modules/api.js'];
const render = sources['modules/render.js'];
const states = sources['modules/ThreadStateViews.js'];

assert.equal((html.match(/social\/shell\/boot\.js/g) || []).length, 1, 'comment route needs one shared shell boot');
assert.ok(html.includes('comment-thread-title') && html.includes('geelooy-content-region'), 'entry needs a labelled region');
for (const token of ['readCommentThreadConfig', 'CommentThreadController', 'controller.start()']) {
	assert.ok(app.includes(token), `Thread entry missing ${token}`);
}
assert.doesNotMatch(app, /publishRouteContext|createCommentThreadShellContext/, 'entry must not revive dead shell-context publication');
for (const fabricated of ['coby', 'ikar', "|| 'post'", '|| "post"']) {
	assert.equal(combined.includes(fabricated), false, `comment route must not fabricate ${fabricated}`);
}
assert.ok(config.includes("missingRead.push('heichel')"), 'Heichel is required to read');
assert.ok(config.includes("missingRead.push('post')"), 'post is required to read');
assert.ok(config.includes('Boolean(aliasId)'), 'alias is separately required to write');
assert.ok(render.includes('if (this.config.missingRead.length)'), 'missing read context must stop loading');
assert.ok(render.includes('createIncompleteThreadState'), 'controller must delegate incomplete state rendering');
assert.ok(render.includes('createReadOnlyThreadNotice'), 'controller must delegate read-only state rendering');
for (const token of ['Choose a conversation', 'context before it can open.', 'Reading mode', 'Choose an alias to join this conversation.']) {
	assert.ok(states.includes(token), `Thread state owner missing honest copy: ${token}`);
}
assert.ok(render.includes('this.config.canWrite'), 'composer visibility must follow write context');
assert.ok(api.includes('/comment-tree') && api.includes('/replies'), 'comment endpoints must stay stable');
for (const [file, source] of Object.entries(sources)) {
	if (file.endsWith('.js')) assert.ok(source.split('\n').length <= 120, `${file} exceeds 120 lines`);
}
console.log('B"H commentThreadRouteContract.test passed');
