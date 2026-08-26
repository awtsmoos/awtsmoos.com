//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationRouteContractTest
 * @description The Awtsmoos reveals loading, emptiness, presentation, and action as distinct vessels;
 * Awtsmoos.com verifies current ownership boundaries so truthful fallback prose and time never drift back into a monolithic card.
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
const presentation = read('NotificationPresentation.js');
const actions = read('NotificationActions.js');

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
for (const token of ['createNotificationBody', 'createNotificationMeta', 'createNotificationTitle']) {
	assert.ok(card.includes(token), `card composition missing ${token}`);
}
assert.ok(card.includes('createNotificationActions'), 'card must delegate action composition');
assert.ok(presentation.includes('No additional message was provided.'), 'presentation must own fallback body copy');
assert.ok(presentation.includes("time.textContent = 'Unknown time'"), 'presentation must own unknown-time fallback');
assert.ok(!presentation.includes('Date.now()'), 'missing timestamps must not become current time');
assert.ok(!presentation.includes('A new movement was recorded.'), 'presentation must not invent activity');
assert.ok(actions.includes('url.origin !== location.origin'), 'actions must reject foreign origins');
assert.ok(actions.includes('data') || actions.includes('dataset.markRead'), 'actions must preserve mark-read delegation');

for (const [name, source] of Object.entries({ controller, emptyState, helpers, render, card, presentation, actions })) {
	assert.ok(lineCount(source) <= 120, `${name} exceeds 120 lines`);
}
console.log('B"H notificationRouteContract.test passed');
