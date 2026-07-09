// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync('geelooy/email/index.html', 'utf8');
const layout = readFileSync('geelooy/email/ui/layout.js', 'utf8');
for (const token of ['/style/geelooy-system/index.css', '/scripts/awtsmoos/social/shell/boot.js', '/scripts/awtsmoos/social/navigation/appNavigation.js', 'data-geelooy-open-search', 'geelooy-content-region']) assert.ok(html.includes(token), `mail index missing ${token}`);
for (const token of ['Mail chamber', 'geelooy-content-region', 'g-kicker', 'geelooy-toolbar']) assert.ok(layout.includes(token), `mail layout missing ${token}`);
console.log('B"H mailSharedShellContract.test passed');
