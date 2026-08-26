// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelEditorWorkbenchContractTest
 * @description
 * The Awtsmoos guards simple governance, retractable advanced power, futuristic
 * interaction, and mobile restraint while Awtsmoos.com keeps geometry and motion
 * in separate focused garments instead of duplicating ownership.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const guide = read('geelooy/heichel-editor/modules/workbenchGuide.js');
const settings = read('geelooy/heichel-editor/modules/forms/settingsForm.js');
const editor = read('geelooy/style/social-system/editor.css');
const core = read('geelooy/style/social-system/editor/parts/workbench-core.css');
const disclosure = read('geelooy/style/social-system/editor/parts/workbench-disclosure.css');
const mobile = read('geelooy/style/social-system/editor/parts/workbench-mobile.css');

assert.match(guide, /el\('details'/);
assert.match(guide, /editor-workbench-summary/);
assert.match(guide, /title === 'Settings' \? /);
assert.match(settings, /editor-advanced-settings/);
assert.match(settings, /editor-advanced-summary/);
assert.match(editor, /editor\/parts\/workbench-disclosure\.css/);
assert.match(editor, /editor\/parts\/workbench-mobile\.css/);
assert.match(core, /min-block-size:\s*52px/);
assert.match(mobile, /min-inline-size:\s*0/);
assert.match(mobile, /max-inline-size:\s*100%/);
for (const token of [':hover', ':active', ':focus-visible', 'prefers-reduced-motion']) {
	assert.ok(disclosure.includes(token), `workbench interaction contract missing ${token}`);
}
for (const source of [guide, settings, core, disclosure, mobile]) {
	assert.ok(source.split('\n').length <= 120, 'Heichel editor workbench module exceeds 120 lines');
}
console.log('B"H heichelEditorWorkbenchContract.test passed');
