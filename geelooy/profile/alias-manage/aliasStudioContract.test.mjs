// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasStudioContractTest
 * @description
 * The Awtsmoos guards identity from falling back into alerts, naked labels, or
 * one giant controller; Awtsmoos.com keeps preview, validation, and danger explicit.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
	return readFileSync(path, 'utf8');
}

const root = 'geelooy/profile/alias-manage';
const html = read(`${root}/index.html`);
const script = read(`${root}/script.js`);
const config = read(`${root}/modules/config.js`);
const validation = read(`${root}/modules/validation.js`);
const preview = read(`${root}/modules/preview.js`);
const actions = read(`${root}/modules/actions.js`);
const deleteFlow = read(`${root}/modules/deleteFlow.js`);
const styles = [
	'style.css',
	'styles/shell.css',
	'styles/fields.css',
	'styles/help-actions.css',
	'styles/advanced.css',
	'styles/command-actions.css',
	'styles/preview.css',
	'styles/responsive.css'
].map(path => read(`${root}/${path}`));

for (const token of [
	'data-alias-studio',
	'class="alias-studio-grid"',
	'class="alias-field-shell',
	'class="alias-advanced"',
	'data-preview-details',
	'data-preview-name',
	'id="alias-form-status"',
	'data-delete-confirm'
]) {
	assert.ok(html.includes(token), `Alias Studio markup missing ${token}`);
}
for (const id of ['alias-name', 'alias-description', 'alias-id', 'id-validation', 'alias-form', 'delete']) {
	assert.ok(html.includes(id), `Alias Studio must preserve ${id}`);
}
assert.match(html, /type="module" src="\.\/script\.js/);
assert.doesNotMatch(html, /<br>|class="tooltip"|console\.log/);
for (const modulePath of ['./modules/config.js', './modules/deleteFlow.js', './modules/validation.js', './modules/preview.js', './modules/actions.js']) {
	assert.ok(script.includes(modulePath), `controller missing ${modulePath}`);
}
assert.match(validation, /checkOrGenerateId/);
assert.match(config, /\/api\/social\/aliases/);
assert.match(actions, /fetch\(config\.endpoint/);
assert.match(deleteFlow, /aria-expanded/);
assert.match(preview, /previewName|previewHandle/);
assert.match(config, /returnURL/);
for (const source of [script, config, validation, preview, actions, deleteFlow]) {
	assert.doesNotMatch(source, /alert\(|console\.(log|error)|style\.color/);
	assert.ok(lineCount(source) <= 120, 'Alias Studio JS modules must remain small');
}
for (const css of styles) {
	assert.ok(css.includes('B"H'), 'Alias Studio CSS must retain B"H');
	assert.ok(lineCount(css) <= 120, 'Alias Studio CSS modules must remain small');
	assert.equal(css.split('{').length, css.split('}').length, 'Alias Studio CSS blocks must balance');
}
const joinedStyles = styles.join('\n');
assert.ok(joinedStyles.includes(':focus-visible'));
assert.ok(joinedStyles.includes(':active'));
assert.ok(joinedStyles.includes('prefers-reduced-motion'));
console.log('B"H aliasStudioContract.test passed');

function lineCount(content) {
	return content.split(String.fromCharCode(10)).length;
}
