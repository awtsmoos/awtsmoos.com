// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SubmitCssContractTest
 * @description
 * The Awtsmoos gives the Awtsmoos.com composer one canonical visual body and
 * one narrow shell-aware garment, while compatibility routes remain delegated.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const submit = readFileSync('geelooy/heichelos/_awtsmoos.submitToHeichel.html', 'utf8');
const manifest = readFileSync('geelooy/heichelos/heichel/submit/style.css', 'utf8');
const shellOverrides = readFileSync('geelooy/heichelos/heichel/submit/shell-overrides.css', 'utf8');
const compatibility = readFileSync('geelooy/style/heichelos/submit/index.css', 'utf8');
const actions = readFileSync('geelooy/style/heichelos/submit/actions.css', 'utf8');
const sections = readFileSync('geelooy/style/heichelos/submit/sections.css', 'utf8');

assert.equal(
	(submit.match(/rel="stylesheet"/g) || []).length,
	2,
	'Create should load canonical composer CSS and one shell override'
);
assert.ok(
	submit.includes('/heichelos/heichel/submit/style.css?v=create-004'),
	'Create must load canonical composer CSS'
);
assert.ok(
	submit.includes('/heichelos/heichel/submit/shell-overrides.css?v=create-005'),
	'Create must load its narrow shell-aware override after canonical CSS'
);
assert.ok(!submit.includes('/style/heichelos/submit/index.css'), 'Create must not load compatibility CSS');
assert.ok(manifest.includes('/style/heichelos/submit/actions.css'), 'canonical manifest imports actions');
assert.ok(compatibility.includes('/heichelos/heichel/submit/style.css'), 'compatibility entry delegates to canonical CSS');
assert.ok(actions.includes('.submit-post-btn'), 'actions partial owns submit button');
assert.ok(sections.includes('.sections-container:empty'), 'sections partial owns empty section state');
assert.ok(shellOverrides.includes('var(--g-dock-h)'), 'shell override clears the canonical dock');
assert.ok(shellOverrides.includes('data-g-context-visible'), 'shell override activates only with shared context');
assert.ok(shellOverrides.split('\n').length <= 120, 'shell override must remain a narrow vessel');

console.log('B"H submitCssContract.test passed');
