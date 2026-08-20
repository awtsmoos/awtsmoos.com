// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelEditorWorkbenchContractTest
 * @description
 * The Awtsmoos guards simple governance, retractable advanced power, futuristic
 * motion, and mobile restraint without changing Awtsmoos.com field/API contracts.
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
assert.match(guide, /title === 'Settings' \? \{ open: '' \}/);
assert.match(guide, /addEventListener\('toggle'/);
assert.match(guide, /details\.editor-workbench-section\[open\]/);

for (const fieldName of [
	'name',
	'description',
	'submissionPolicy',
	'submissionApprovalMode',
	'bannerUrl',
	'themeAccent',
	'maxUploadBytes'
]) {
	assert.match(settings, new RegExp(`field\\('${fieldName}'`));
}
assert.match(settings, /editor-advanced-settings/);
assert.match(settings, /Advanced settings/);
assert.match(settings, /Branding, theme accent, and upload limits/);

assert.match(editor, /editor\/parts\/workbench-core\.css/);
assert.match(editor, /editor\/parts\/workbench-disclosure\.css/);
assert.match(editor, /editor\/parts\/workbench-mobile\.css/);
assert.ok(
	editor.indexOf('workbench-core.css') < editor.indexOf('states.css'),
	'workbench styles must load before editor state and action layers'
);

assert.match(core, /\.editor-workbench-section/);
assert.match(core, /min-block-size:\s*52px/);
assert.match(disclosure, /\.editor-advanced-settings/);
assert.match(disclosure, /@keyframes editor-panel-reveal/);
assert.match(mobile, /@media \(max-width:\s*42rem\)/);
assert.match(mobile, /prefers-reduced-motion:\s*reduce/);

for (const source of [guide, settings, editor, core, disclosure, mobile]) {
	assert.ok(source.split('\n').length <= 120, 'Heichel editor workbench module exceeds 120 lines');
}

console.log('B"H heichelEditorWorkbenchContract.test passed');
