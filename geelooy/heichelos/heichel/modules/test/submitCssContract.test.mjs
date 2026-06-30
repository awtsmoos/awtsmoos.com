// B"H
/**
 * Chapter 642: submit CSS has one entry and clear partial ownership.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const submit = readFileSync('geelooy/heichelos/_awtsmoos.submitToHeichel.html', 'utf8');
const manifest = readFileSync('geelooy/heichelos/heichel/submit/style.css', 'utf8');
const compatibility = readFileSync('geelooy/style/heichelos/submit/index.css', 'utf8');
const actions = readFileSync('geelooy/style/heichelos/submit/actions.css', 'utf8');
const sections = readFileSync('geelooy/style/heichelos/submit/sections.css', 'utf8');

assert.equal((submit.match(/rel="stylesheet"/g) || []).length, 1, 'new submit route should load one stylesheet');
assert.ok(!submit.includes('/style/heichelos/submit/index.css'), 'new submit route must not load compatibility CSS');
assert.ok(manifest.includes('/style/heichelos/submit/actions.css'), 'canonical manifest imports actions');
assert.ok(compatibility.includes('/heichelos/heichel/submit/style.css'), 'compatibility entry delegates to canonical CSS');
assert.ok(actions.includes('.submit-post-btn'), 'actions partial owns submit button');
assert.ok(sections.includes('.sections-container:empty'), 'sections partial owns empty section state');
console.log('B"H submitCssContract.test passed');
