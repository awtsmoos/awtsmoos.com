// B"H
/**
 * Chapter 643: Heichel editor is modular and refuses fake write identity.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const app = readFileSync('geelooy/heichel-editor/app.js', 'utf8');
const config = readFileSync('geelooy/heichel-editor/modules/config.js', 'utf8');
const render = readFileSync('geelooy/heichel-editor/modules/render.js', 'utf8');

for (const file of [
  'geelooy/heichel-editor/modules/api.js',
  'geelooy/heichel-editor/modules/dom.js',
  'geelooy/heichel-editor/modules/forms/settingsForm.js',
  'geelooy/heichel-editor/modules/forms/inviteForm.js',
  'geelooy/heichel-editor/modules/forms/submissionForm.js'
]) assert.ok(existsSync(file), `${file} must exist`);

assert.ok(app.includes('readEditorConfig') && app.includes('renderEditor'), 'app should delegate to modules');
assert.ok(!app.includes("|| 'ikar'") && !app.includes("|| 'coby'"), 'app must not default to fake params');
assert.ok(config.includes('missing.push("heichel")') && config.includes('missing.push("alias")'), 'config tracks missing params');
assert.ok(render.includes('Governance actions are disabled'), 'missing param state must be explicit');
console.log('B"H heichelEditorSplit.test passed');
