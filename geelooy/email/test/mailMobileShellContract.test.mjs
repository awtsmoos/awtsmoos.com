// B"H
/**
 * Chapter 158: mail mobile shell contract now expects the immense split CSS.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const entry = readFileSync('geelooy/email/css/social-shell.css', 'utf8');
const layout = readFileSync('geelooy/email/ui/layout.js', 'utf8');
const dir = 'geelooy/email/css/social-shell-parts';
const files = ['base.css', 'topbar.css', 'frame.css', 'sidebar-theme.css', 'thread-list.css', 'tabs.css', 'chat-theme.css', 'bottom-nav.css', 'empty.css', 'mobile.css'];

for (const file of files) {
  assert.ok(entry.includes(`./social-shell-parts/${file}`), `entry missing ${file}`);
  const source = readFileSync(`${dir}/${file}`, 'utf8');
  assert.ok(source.split('\n').length <= 80, `${file} should stay small`);
}
const joined = files.map(file => readFileSync(`${dir}/${file}`, 'utf8')).join('\n');
for (const token of ['min-height: 100dvh', 'overflow-y: auto', '.mail-bottom-nav', '.thread-list', 'padding: 0 1rem 7rem']) assert.ok(joined.includes(token), `mail css missing ${token}`);
assert.ok(joined.includes('position: sticky; bottom: 0'), 'bottom nav must be sticky, not cover unread space');
assert.ok(joined.includes('height:auto!important'), 'mobile app container must not trap fixed height');
assert.deepEqual(readdirSync(dir).filter(name => name.endsWith('.css')).sort(), files.sort());
for (const token of ['mail-social-shell', 'mail-social-frame', 'mail-bottom-nav']) assert.ok(layout.includes(token), `layout missing ${token}`);
console.log('B"H mailMobileShellContract.test passed');
