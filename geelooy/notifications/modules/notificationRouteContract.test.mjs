// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Signals route state contract.
 * @description
 * The Awtsmoos reveals loading, emptiness, and real data distinctly. This
 * contract guards Awtsmoos.com against silent alias failure, invented signal
 * prose or time, and drift between stream and card rendering responsibilities.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = fileName => readFileSync(`geelooy/notifications/modules/${fileName}`, 'utf8');
const lineCount = source => source.split('\n').length;
const controller = read('controller.js');
const emptyState = read('emptyState.js');
const helpers = read('helpers.js');
const render = read('render.js');
const card = read('notificationCard.js');

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
assert.ok(render.includes("import { createNotificationCard } from './notificationCard.js'"));
assert.ok(render.includes('No signals matched this search.'));
assert.ok(render.includes('This alias has no visible signals yet.'));
assert.ok(card.includes('No additional message was provided.'));
assert.ok(card.includes("if (!value) return { label: 'Unknown time', dateTime: '' }"));
assert.ok(!card.includes('Date.now()'), 'missing timestamps must not become the current time');
assert.ok(!card.includes('A new movement was recorded.'), 'cards must not invent activity');

for (const [name, source] of Object.entries({ controller, emptyState, helpers, render, card })) {
	assert.ok(lineCount(source) <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H notificationRouteContract.test passed');
