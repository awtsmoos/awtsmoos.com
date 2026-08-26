//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationUxContractTest
 * @description The Awtsmoos lets common signal paths remain near while deep refinement waits for a conscious reveal;
 * Awtsmoos.com guards category-first navigation, closed Advanced filters, logical touch reach, bounded scrolling, and V5 action hierarchy on every screen.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'geelooy/notifications';
const page = readFileSync(`${base}/index.html`, 'utf8');
const categoryTabs = readFileSync(`${base}/modules/categoryTabs.js`, 'utf8');
const workspace = readFileSync(`${base}/styles/workspace.css`, 'utf8');
const items = readFileSync(`${base}/styles/items.css`, 'utf8');
const categories = readFileSync(`${base}/styles/revelation-categories.css`, 'utf8');
const controls = readFileSync(`${base}/styles/revelation-controls.css`, 'utf8');
const disclosure = readFileSync(`${base}/styles/revelation-disclosure.css`, 'utf8');
const fields = readFileSync(`${base}/styles/revelation-fields.css`, 'utf8');
const responsive = readFileSync(`${base}/styles/revelation-responsive.css`, 'utf8');
const actionsV5 = readFileSync(`${base}/styles/signal-actions-v4.css`, 'utf8');

assert.match(page, /id="signalAdvancedFilters" class="notifications-filter-panel"/);
assert.doesNotMatch(page, /id="signalAdvancedFilters"[^>]*\sopen(?:\s|>)/);
assert.match(page, /class="signal-category-tabs"/);
for (const type of ['', 'mention', 'comment', 'submission_created', 'system']) {
	assert.ok(page.includes(`data-signal-type="${type}"`), `quick category missing ${type || 'all'}`);
}
assert.match(page, /modules\/categoryTabs\.js/);
assert.match(page, /id="more"[^>]*>Load more</);
assert.match(page, /id="list" class="notifications-list"/);
assert.doesNotMatch(page, /awts-scroll-region|data-scroll-region/);

for (const token of [
	'form.requestSubmit()',
	"select.value = tab.dataset.signalType || ''",
	"tab.setAttribute('aria-pressed', String(active))"
]) {
	assert.ok(categoryTabs.includes(token), `category controller missing ${token}`);
}
assert.doesNotMatch(categoryTabs, /matchMedia/, 'category tabs must not open Advanced by viewport width');
assert.doesNotMatch(categoryTabs, /\.open\s*=\s*true/, 'category tabs must not force Advanced open');
assert.match(workspace, /\.notifications-list\s*\{[\s\S]*align-content:\s*start;/);
assert.match(categories, /button\[aria-pressed="true"\]/);
assert.match(disclosure, /#signalAdvancedFilters\[open\]/);
assert.match(fields, /\.signal-field:focus-within/);
assert.match(responsive, /max-height:\s*calc\(100dvh/);
assert.match(responsive, /@media \(max-width: 760px\)/);

assert.match(items, /\.notification-row-actions :where\(a, button\)/);
assert.match(items, /min-height:\s*44px;/);
assert.doesNotMatch(items, /min-height:\s*40px;/);
for (const token of [
	'notification-primary-action',
	'notification-secondary-actions',
	'min-block-size: 44px',
	'position: fixed',
	'safe-area-inset-left',
	'max-inline-size: calc(100vw - 1.3rem)',
	'max-block-size: min(56dvh, 22rem)',
	'overflow: auto',
	'overscroll-behavior: contain',
	':hover',
	':active',
	':focus-visible',
	'prefers-reduced-motion'
]) {
	assert.ok(actionsV5.includes(token), `Notifications V5 action CSS missing ${token}`);
}
assert.match(actionsV5, /@media \(max-width:\s*38\.75rem\)/);

for (const [name, source] of Object.entries({
	workspace,
	items,
	categories,
	controls,
	disclosure,
	fields,
	responsive,
	actionsV5,
	categoryTabs
})) {
	assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
}
console.log('B"H notificationUxContract.test passed');
