// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationRouteContractTest
 * @description
 * The Awtsmoos gives identity, pages, and signals distinct honest stations;
 * Awtsmoos.com tests the living boundaries, not obsolete implementations.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = name => readFileSync(`geelooy/notifications/modules/${name}`, 'utf8');
const lineCount = source => source.split('\n').length;
const controller = read('controller.js');
const pageLoader = read('NotificationPageLoader.js');
const requestGate = read('NotificationRequestGate.js');
const emptyState = read('emptyState.js');
const helpers = read('helpers.js');
const render = read('render.js');
const card = read('notificationCard.js');
const presentation = read('NotificationPresentation.js');
const actions = read('NotificationActions.js');

for (const token of [
	"import { showAliasRequired } from './emptyState.js'",
	"import { NotificationPageLoader } from './NotificationPageLoader.js'",
	"form.setAttribute('aria-busy', 'true')",
	'showAliasRequired(context, aliasResult.error)',
	'showAliasRequired(context)',
	'loader.gate.cancel()'
]) {
	assert.ok(controller.includes(token), `controller missing ${token}`);
}

for (const token of [
	'new NotificationRequestGate()',
	'getNotifications(aliasId, query, { signal: ticket.signal })',
	'ticket.isCurrent()',
	'if (markAll) markAll.disabled = false',
	'Notifications timed out.'
]) {
	assert.ok(pageLoader.includes(token), `notification loader missing ${token}`);
}
assert.ok(requestGate.includes('this.current?.controller.abort()'));

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
assert.ok(!helpers.includes('catch {}'));
assert.ok(render.includes("import { createNotificationCard } from './notificationCard.js'"));
assert.ok(render.includes('No signals matched this search.'));
assert.ok(render.includes('This alias has no visible signals yet.'));
for (const token of ['createNotificationBody', 'createNotificationMeta', 'createNotificationTitle']) {
	assert.ok(card.includes(token), `card composition missing ${token}`);
}
assert.ok(card.includes('createNotificationActions'));
assert.ok(presentation.includes('No additional message was provided.'));
assert.ok(presentation.includes("time.textContent = 'Unknown time'"));
assert.ok(!presentation.includes('Date.now()'));
assert.ok(actions.includes('url.origin !== location.origin'));
assert.ok(actions.includes('data') || actions.includes('dataset.markRead'));
for (const [name, source] of Object.entries({
	controller, pageLoader, requestGate, emptyState, helpers, render, card, presentation, actions
})) {
	assert.ok(lineCount(source) <= 120, `${name} exceeds 120 lines`);
}
console.log('B"H notificationRouteContract.test passed');
