// B"H
/**
 * Chapter 93: scrolling contract for the mobile navigation page.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shell = readFileSync('geelooy/style/heichelos/heichel/shell.css', 'utf8');
const search = readFileSync('geelooy/style/heichelos/heichel/search.css', 'utf8');
const bottom = readFileSync('geelooy/style/heichelos/heichel/bottom-nav.css', 'utf8');

assert.match(shell, /html, body \{[^}]*overflow-y:\s*auto/s, 'body must allow scroll');
assert.match(shell, /\.geelooy-social-shell \{[^}]*overflow:\s*visible/s, 'shell must not trap scroll');
assert.match(shell, /\.geelooy-main-stage \{[^}]*overflow:\s*visible/s, 'main stage must not trap scroll');
assert.match(shell, /\.dynamic-grid \{[^}]*padding-bottom:\s*7rem/s, 'list must pad under fixed nav');
assert.match(search, /\.series-search-row \{[^}]*position:\s*sticky/s, 'search should be sticky');
assert.match(bottom, /\.geelooy-bottom-nav \{[^}]*position:\s*fixed/s, 'bottom nav should be fixed');
assert.doesNotMatch(shell, /height:\s*100vh/, 'shell must not use fixed 100vh height');
console.log('B"H scrollContract.test passed');
