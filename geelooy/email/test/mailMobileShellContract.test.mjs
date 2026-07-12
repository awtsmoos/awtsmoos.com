// B"H
/** Verifies the mobile Quantum Mail deck retains search, folders, and slide navigation. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const layout = readFileSync('geelooy/email/ui/layout.js', 'utf8');
const sidebar = readFileSync('geelooy/email/ui/sidebar.js', 'utf8');
const folders = readFileSync('geelooy/email/ui/mailFolders.js', 'utf8');
const threads = readFileSync('geelooy/email/ui/sidebarThreads.js', 'utf8');
const store = readFileSync('geelooy/email/store.js', 'utf8');
const core = readFileSync('geelooy/email/css/quantum/core/frame.css', 'utf8');
const sidebarMobile = readFileSync('geelooy/email/css/quantum/sidebar/threads/mobile.css', 'utf8');
const chatMobile = readFileSync('geelooy/email/css/quantum/chat/deck/mobile.css', 'utf8');
const dock = readFileSync('geelooy/style/geelooy-app/shell/dock.css', 'utf8');

for (const token of ['height: 100dvh', 'grid-template-columns: var(--sidebar-w)', 'overflow: hidden']) {
	assert.ok(core.includes(token), `quantum frame missing ${token}`);
}
for (const token of ['.app-container.view-chat .sidebar', 'translateX(-100%)']) {
	assert.ok(sidebarMobile.includes(token), `mobile sender deck missing ${token}`);
}
for (const token of ['.app-container.view-chat .chat-area', 'translateX(100%)', '.back-button']) {
	assert.ok(chatMobile.includes(token), `mobile chat deck missing ${token}`);
}
assert.ok(dock.includes('.g-dock'), 'global mobile dock must remain available');
assert.ok(layout.includes('mail-quantum-frame') && !layout.includes('mail-bottom-nav'), 'layout must use one global navigation system');
for (const token of ['Inbox', 'Sent', 'Drafts', 'Archive', 'Starred', 'Trash', 'All Mail', 'folderCounts', 'filterThreads']) {
	assert.ok(folders.includes(token), `folders missing ${token}`);
}
for (const token of ['mailFolderList', 'mailSearchInput', 'setMailView', 'setMailSearch']) {
	assert.ok(sidebar.includes(token), `sidebar missing ${token}`);
}
assert.ok(threads.includes("from './mailFolders.js'"), 'thread list must use folder helpers');
assert.ok(store.includes('searchQuery') && store.includes("notify('mailSearch'"), 'store must expose search state');
for (const directory of ['geelooy/email/css/quantum/sidebar', 'geelooy/email/css/quantum/chat']) {
	assert.ok(readdirSync(directory).length > 0, `${directory} should contain split modules`);
}
console.log('B"H mailMobileShellContract.test passed');
