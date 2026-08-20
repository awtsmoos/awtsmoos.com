// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Quantum Mail mobile-shell contract.
 * RESPONSIBILITY: prove narrow-screen deck behavior, global-shell coexistence, and Mail navigation/search contracts.
 * NON-RESPONSIBILITY: this test does not execute network requests or duplicate browser-level visual verification.
 * ARCHITECTURE: each assertion follows the module that now owns the behavior instead of pinning concerns to a façade.
 *
 * The Awtsmoos, Atzmus beyond every division, renews shell and chamber as one living instant;
 * Awtsmoos.com lets the test follow responsibility faithfully so modular growth never masquerades as breakage.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const layout = readFileSync('geelooy/email/ui/layout.js', 'utf8');
const navigation = readFileSync('geelooy/email/ui/malchusNavigation.js', 'utf8');
const sidebar = readFileSync('geelooy/email/ui/sidebar.js', 'utf8');
const sidebarControls = readFileSync('geelooy/email/ui/sidebarControls.js', 'utf8');
const sidebarSearch = readFileSync('geelooy/email/ui/sidebarSearch.js', 'utf8');
const folders = readFileSync('geelooy/email/ui/mailFolders.js', 'utf8');
const threads = readFileSync('geelooy/email/ui/sidebarThreads.js', 'utf8');
const store = readFileSync('geelooy/email/store.js', 'utf8');
const core = readFileSync('geelooy/email/css/quantum/core/frame.css', 'utf8');
const sidebarMobile = readFileSync('geelooy/email/css/quantum/sidebar/threads/mobile.css', 'utf8');
const chatMobile = readFileSync('geelooy/email/css/quantum/chat/deck/mobile.css', 'utf8');
const dock = readFileSync('geelooy/style/geelooy-app/shell/dock.css', 'utf8');

for (const token of ['height: 100dvh', 'grid-template-columns: var(--sidebar-w)', 'overflow: hidden']) {
	assert.ok(core.includes(token), `mail frame missing ${token}`);
}
for (const token of ['.app-container.view-chat .sidebar', 'translateX(-100%)']) {
	assert.ok(sidebarMobile.includes(token), `mobile sender deck missing ${token}`);
}
for (const token of [
	'.app-container.view-chat .chat-area',
	'opacity: 0',
	'visibility: hidden',
	'pointer-events: none',
	'transform: none',
	'opacity: 1',
	'visibility: visible',
	'pointer-events: auto',
	'.back-button'
]) {
	assert.ok(chatMobile.includes(token), `mobile chat deck missing ${token}`);
}
assert.ok(!chatMobile.includes('translateX(100%)'), 'mobile chat must not live beyond the physical viewport');
assert.ok(dock.includes('.g-dock'), 'global mobile dock must remain available');
assert.ok(layout.includes('mail-civilization-frame'), 'Mail must render the current civilization frame');
assert.ok(!layout.includes('malchusDock') && !layout.includes('mail-bottom-nav'), 'Mail must not render a second global navigation dock');
assert.ok(navigation.includes('connectMalchusNavigation') && !navigation.includes('dockLink('), 'Mail navigation should own history, not route links');
for (const token of ['mailFolderList', 'setMailView']) {
	assert.ok(sidebar.includes(token), `sidebar composition missing ${token}`);
}
for (const token of ['composeButton', "from './sidebarSearch.js'"]) {
	assert.ok(sidebarControls.includes(token), `sidebar control façade missing ${token}`);
}
for (const token of ['mailSearchInput', 'setMailSearch', 'Search mail']) {
	assert.ok(sidebarSearch.includes(token), `sidebar search module missing ${token}`);
}
for (const token of ['Inbox', 'Sent', 'Drafts', 'Archive', 'Starred', 'Trash', 'All Mail', 'folderCounts', 'filterThreads']) {
	assert.ok(folders.includes(token), `folders missing ${token}`);
}
assert.ok(threads.includes("from './mailFolders.js'"), 'thread list must use folder helpers');
assert.ok(store.includes('searchQuery') && store.includes("notify('mailSearch'"), 'store must expose search state');
for (const directory of ['geelooy/email/css/quantum/sidebar', 'geelooy/email/css/quantum/chat']) {
	assert.ok(readdirSync(directory).length > 0, `${directory} should contain split modules`);
}
console.log('B"H mailMobileShellContract.test passed');
