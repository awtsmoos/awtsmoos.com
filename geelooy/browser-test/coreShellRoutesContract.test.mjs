// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const checks = [
  ['geelooy/index.html', 'data-home-dashboard-page'],
  ['geelooy/profile/index.html', '/scripts/awtsmoos/social/shell/boot.js'],
  ['geelooy/heichelos/_awtsmoos.index.html', 'data-heichelos-index'],
  ['geelooy/heichelos/_awtsmoos.submitToHeichel.html', 'data-geelooy-create-page'],
  ['geelooy/email/index.html', 'data-mail-page'],
  ['geelooy/heichelos/_awtsmoos.heichel.html', 'data-heichel-page']
];
for (const [file, marker] of checks) {
  const html = readFileSync(file, 'utf8');
  assert.ok(html.includes(marker), `${file} missing route marker ${marker}`);
  assert.ok(html.includes('/style/geelooy-system/index.css'), `${file} missing geelooy system css`);
}
console.log('B"H coreShellRoutesContract.test passed');
