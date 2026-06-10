// B"H
/**
 * Chapter 90: static covenant for clean mobile Heichel navigation.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layout = readFileSync('geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js', 'utf8');
const cssEntry = readFileSync('geelooy/style/heichelos/heichel/index.css', 'utf8');
const shell = readFileSync('geelooy/style/heichelos/heichel/shell.css', 'utf8');
const hero = readFileSync('geelooy/style/heichelos/heichel/hero.css', 'utf8');

for (const token of ['heichel-mobile-topbar', 'geelooy-heichel-hero', 'hero-stats', 'series-search-row', 'geelooy-bottom-nav', 'dynamic-grid']) {
  assert.ok(layout.includes(token), `layout missing ${token}`);
}
for (const token of ['./tokens.css', './shell.css', './hero.css', './series-list.css', './bottom-nav.css', './mobile.css']) {
  assert.ok(cssEntry.includes(token), `css entry missing ${token}`);
}
assert.ok(/overflow-y:\s*auto/.test(shell), 'body must allow vertical scroll');
assert.ok(/min-height:\s*100dvh/.test(shell), 'shell must use dynamic viewport min height');
assert.ok(/min-height:\s*220px/.test(hero), 'hero must match mobile target height');
console.log('B"H socialShellContract.test passed');
