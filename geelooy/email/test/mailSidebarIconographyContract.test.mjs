// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Quantum Mail sidebar iconography and navigation contract.
 * RESPONSIBILITY: guard presentation metadata, vector actions, semantic search IDs, modular CSS, and reduced-motion support.
 * NON-RESPONSIBILITY: actual browser execution remains a separate runtime gate.
 *
 * The Awtsmoos gives every mailbox pathway a sign while remaining beyond every finite mark;
 * Awtsmoos.com keeps source promises explicit so runtime testing can expose any darkness after dark.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
	categoryPresentation,
	folderPresentation
} from '../ui/sidebarPresentation.js';

const root = 'geelooy/email';
const choices = readFileSync(`${root}/ui/sidebarChoices.js`, 'utf8');
const controls = readFileSync(`${root}/ui/sidebarControls.js`, 'utf8');
const search = readFileSync(`${root}/ui/sidebarSearch.js`, 'utf8');
const searchView = readFileSync(`${root}/ui/sidebarSearchView.js`, 'utf8');
const iconCss = readFileSync(`${root}/css/system/sidebar-iconography.css`, 'utf8');
const choiceCss = readFileSync(`${root}/css/system/sidebar-choices.css`, 'utf8');
const controlsCss = readFileSync(`${root}/css/system/sidebar-controls.css`, 'utf8');
const metadataCss = readFileSync(`${root}/css/system/sidebar-command-meta.css`, 'utf8');
const searchCss = readFileSync(`${root}/css/system/sidebar-revelation.css`, 'utf8');
const manifest = readFileSync(`${root}/css/sidebar.css`, 'utf8');

assert.deepEqual(folderPresentation({ id: 'inbox', label: 'Inbox' }), {
	emoji: '📥',
	label: 'Inbox'
});
assert.deepEqual(categoryPresentation({ id: 'unread', label: '📩 Unread' }), {
	emoji: '📩',
	label: 'Unread'
});

for (const token of ['mail-choice-emoji', 'mail-choice-label', 'mail-folder-count', 'button.dataset[kind]', 'aria-selected']) {
	assert.ok(choices.includes(token), `sidebar choices missing ${token}`);
}
for (const token of ['mail-vector-compose', 'mail-primary-command', 'mail-compose-key', 'composeButton']) {
	assert.ok(controls.includes(token), `sidebar compose control missing ${token}`);
}
assert.ok(!controls.includes('compose-plus'), 'legacy compose plus glyph must not return');
assert.ok(!controls.includes("['compose-shortcut']"), 'sidebar keycap must not reuse modal shortcut class');

for (const token of ['mailSearchInput', 'setMailSearch', 'searchControl', 'clearSearch']) {
	assert.ok(search.includes(token), `sidebar search coordinator missing ${token}`);
}
for (const token of ['mail-vector-search', 'mail-vector-clear', 'Clear conversation search', "type: 'search'"]) {
	assert.ok(searchView.includes(token), `sidebar search view missing ${token}`);
}
for (const token of ['compose.svg', 'search.svg', 'clear.svg', 'mail-choice-emoji']) {
	assert.ok(iconCss.includes(token), `sidebar vector CSS missing ${token}`);
}
for (const css of [iconCss, choiceCss, controlsCss, searchCss]) {
	assert.ok(css.includes('prefers-reduced-motion'), 'interactive sidebar CSS must honor reduced motion');
}
for (const token of ['mail-compose-key', 'mail-search-shortcut', 'mail-search-heading']) {
	assert.ok(metadataCss.includes(token), `sidebar command metadata CSS missing ${token}`);
}
for (const file of ['sidebar-iconography.css', 'sidebar-controls.css', 'sidebar-command-meta.css', 'sidebar-choices.css']) {
	assert.ok(manifest.includes(`${file}?v=mail-revelation-005`), `sidebar manifest missing ${file}`);
}
for (const icon of ['compose', 'search', 'clear']) {
	assert.ok(existsSync(`${root}/assets/icons/navigation/${icon}.svg`), `sidebar SVG missing ${icon}`);
}

console.log('B"H mailSidebarIconographyContract.test passed');
