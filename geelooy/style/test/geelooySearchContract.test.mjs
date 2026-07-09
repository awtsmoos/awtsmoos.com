// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const spotlight = readFileSync('geelooy/scripts/awtsmoos/social/shell/spotlight.js', 'utf8');
const css = readFileSync('geelooy/style/geelooy-system/search.css', 'utf8');
for (const token of ['Posts', 'Series', 'People', 'Aliases', 'Heichelos', 'Mail', 'Commands', 'Media', 'spotlightSources']) assert.ok(spotlight.includes(token), `spotlight missing ${token}`);
for (const token of ['geelooy-spotlight-sources', 'geelooy-spotlight-commands']) assert.ok(css.includes(token), `search css missing ${token}`);
console.log('B"H geelooySearchContract.test passed');
