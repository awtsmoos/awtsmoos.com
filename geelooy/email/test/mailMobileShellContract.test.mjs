// B"H
/**
 * Chapter 708: mail mobile shell contract keeps the split CSS and verifies the
 * folder/search gate that rides on confirmed `/api/social/mail/get` data.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const entry = readFileSync('geelooy/email/css/social-shell.css', 'utf8');
const layout = readFileSync('geelooy/email/ui/layout.js', 'utf8');
const sidebar = readFileSync('geelooy/email/ui/sidebar.js', 'utf8');
const folders = readFileSync('geelooy/email/ui/mailFolders.js', 'utf8');
const threads = readFileSync('geelooy/email/ui/sidebarThreads.js', 'utf8');
const store = readFileSync('geelooy/email/store.js', 'utf8');
const dir = 'geelooy/email/css/social-shell-parts';
const files = ['base.css', 'topbar.css', 'frame.css', 'sidebar-theme.css', 'thread-list.css', 'tabs.css', 'chat-theme.css', 'bottom-nav.css', 'empty.css', 'mobile.css'];

for (const file of files) {
  assert.ok(entry.includes(`./social-shell-parts/${file}`), `entry missing ${file}`);
  const source = readFileSync(`${dir}/${file}`, 'utf8');
  assert.ok(source.split('\n').length <= 80, `${file} should stay small`);
}
const joined = files.map(file => readFileSync(`${dir}/${file}`, 'utf8')).join('\n');
for (const token of ['min-height: 100dvh', 'overflow-y: auto', '.mail-bottom-nav', '.thread-list', 'padding: 0 1rem 7rem']) assert.ok(joined.includes(token), `mail css missing ${token}`);
for (const token of ['position: sticky; bottom: 0', 'height:auto!important', '.mail-folder-list', '.mail-search-panel']) assert.ok(joined.includes(token), `mail css missing ${token}`);
assert.deepEqual(readdirSync(dir).filter(name => name.endsWith('.css')).sort(), files.sort());
for (const token of ['mail-social-shell', 'mail-social-frame', 'mail-bottom-nav']) assert.ok(layout.includes(token), `layout missing ${token}`);
for (const token of ['Inbox', 'Sent', 'Drafts', 'Archive', 'Starred', 'Trash', 'All Mail', 'folderCounts', 'filterThreads']) assert.ok(folders.includes(token), `folders missing ${token}`);
for (const token of ['mailFolderList', 'mailSearchInput', 'setMailView', 'setMailSearch']) assert.ok(sidebar.includes(token), `sidebar missing ${token}`);
assert.ok(threads.includes("from './mailFolders.js'"), 'thread list must use folder helpers');
assert.ok(store.includes('searchQuery') && store.includes('notify(\'mailSearch\''), 'store must expose search state');
console.log('B"H mailMobileShellContract.test passed');
