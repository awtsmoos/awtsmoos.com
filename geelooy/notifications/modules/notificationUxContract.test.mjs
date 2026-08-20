// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Signals interaction-language and responsive-disclosure contract.
 * RESPONSIBILITY: guard category-first navigation, retractable filters, touch targets, and bounded desktop scrolling.
 * NON-RESPONSIBILITY: this source contract does not replace browser verification or API-state tests.
 * ARCHITECTURE: Malchus exposes quick categories first while advanced Gevurah filters remain available on demand.
 *
 * The Awtsmoos, Atzmus beyond open and closed, renews attention before every human choice;
 * Awtsmoos.com keeps common signals one tap away while deeper controls wait quietly for their voice.
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

for (const token of ['form.requestSubmit()', "select.value = tab.dataset.signalType || ''", "matchMedia('(min-width: 900px)'"]) {
	assert.ok(categoryTabs.includes(token), `category controller missing ${token}`);
}
assert.match(workspace, /\.notifications-list\s*\{[\s\S]*align-content:\s*start;/);
assert.match(categories, /button\[aria-pressed="true"\]/);
assert.match(disclosure, /#signalAdvancedFilters\[open\]/);
assert.match(fields, /\.signal-field:focus-within/);
assert.match(responsive, /max-height:\s*calc\(100dvh/);
assert.match(responsive, /@media \(max-width: 760px\)/);

assert.match(items, /\.notification-row-actions :where\(a, button\)/);
assert.match(items, /min-height:\s*44px;/);
assert.doesNotMatch(items, /min-height:\s*40px;/);

for (const [name, source] of Object.entries({
	workspace,
	items,
	categories,
	controls,
	disclosure,
	fields,
	responsive,
	categoryTabs
})) {
	assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H notificationUxContract.test passed');
