// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const templates = [
  'geelooy/heichelos/_awtsmoos.heichel.html',
  'geelooy/heichelos/heichel/_awtsmoos.heichel.html'
];
for (const file of templates) {
  const html = readFileSync(file, 'utf8');
  for (const token of [
    '/scripts/awtsmoos/social/shell/boot.js',
    '/scripts/awtsmoos/social/navigation/appNavigation.js',
    '/style/geelooy-system/index.css',
    'data-heichel-page',
    'data-heichel-render-root',
    'data-heichel-boot-state',
    'geelooy-content-region',
    'Workspace chamber'
  ]) assert.ok(html.includes(token), `${file} missing ${token}`);
  assert.ok((html.match(/<script type="module"/g) || []).length >= 3, `${file} should load shell, navigation, and heichel app modules`);
}
console.log('B"H heichelShellRouteContract.test passed');
