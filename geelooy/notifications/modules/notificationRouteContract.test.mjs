// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Signals route state contract.
 * @description
 * The Awtsmoos reveals loading, emptiness, and real data distinctly. This
 * contract guards the Awtsmoos.com route against silent alias failure,
 * fabricated notification prose or time, and oversized source vessels.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = fileName => readFileSync(`geelooy/notifications/modules/${fileName}`, 'utf8');
const lineCount = source => source.split('\n').length;
const controller = read('controller.js');
const emptyState = read('emptyState.js');
const helpers = read('helpers.js');
const render = read('render.js');

for (const token of [
	"import { showAliasRequired } from './emptyState.js'",
	"form.setAttribute('aria-busy', 'true')",
	'else showAliasRequired(context, aliasResult.error)',
	'else showAliasRequired(context)'
]) {
	assert.ok(controller.includes(token), `controller missing ${token}`);
}

for (const token of [
	"form.setAttribute('aria-busy', 'false')",
	'markAll.disabled = true',
	'Choose an alias to view signals',
	'Sign in to use your default alias'
]) {
	assert.ok(emptyState.includes(token), `empty state missing ${token}`);
}

assert.ok(helpers.includes('return { aliasId, error: null }'));
assert.ok(helpers.includes('error instanceof Error'));
assert.ok(!helpers.includes('catch {}'), 'alias errors must not disappear');
assert.ok(render.includes('No additional message was provided.'));
assert.ok(render.includes("if (!value) return 'Unknown time'"));
assert.ok(!render.includes('Date.now()'), 'missing timestamps must not become the current time');
assert.ok(!render.includes('A new movement was recorded.'), 'renderer must not invent activity');

for (const [name, source] of Object.entries({ controller, emptyState, helpers, render })) {
	assert.ok(lineCount(source) <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H notificationRouteContract.test passed');
