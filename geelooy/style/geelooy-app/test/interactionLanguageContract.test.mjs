// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module InteractionLanguageContract
 * @description
 * The Awtsmoos guards Awtsmoos.com from collapsing back into anonymous links,
 * gray text boxes, motionless controls, or forgotten native interaction types.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = 'geelooy/style/geelooy-app';
const files = {
	manifest: `${root}/surfaces.css`,
	tokens: `${root}/tokens.css`,
	controls: `${root}/surfaces/controls.css`,
	controlMotion: `${root}/surfaces/control-motion.css`,
	links: `${root}/surfaces/links.css`,
	fields: `${root}/surfaces/native-fields.css`,
	fieldMotion: `${root}/surfaces/field-motion.css`,
	choices: `${root}/surfaces/native-choices.css`,
	special: `${root}/surfaces/native-special-inputs.css`,
	disclosures: `${root}/surfaces/native-disclosures.css`,
	status: `${root}/surfaces/native-status-controls.css`,
	editable: `${root}/surfaces/native-editable.css`
};

const styles = Object.fromEntries(
	Object.entries(files).map(([name, path]) => [name, readFileSync(path, 'utf8')])
);

for (const [name, css] of Object.entries(styles)) {
	assert.ok(css.includes('B"H'), `${name} must begin from B"H`);
	assert.ok(css.split('\n').length <= 121, `${name} must remain within 120 source lines`);
	assert.equal(css.split('{').length, css.split('}').length, `${name} must balance CSS blocks`);
}

for (const moduleName of [
	'links.css',
	'control-motion.css',
	'field-motion.css',
	'native-disclosures.css',
	'native-status-controls.css',
	'native-editable.css'
]) {
	assert.ok(styles.manifest.includes(moduleName), `manifest must import ${moduleName}`);
}

assert.ok(styles.tokens.includes('--g-control-hover'), 'tokens must own intense hover depth');
assert.ok(styles.tokens.includes('--g-control-active'), 'tokens must own pressure depth');
assert.ok(styles.controls.includes('background-position'), 'buttons must own spectral sweep geometry');
assert.ok(styles.controlMotion.includes(':hover:not(:disabled)'), 'buttons must reveal hover energy');
assert.ok(styles.controlMotion.includes(':active:not(:disabled)'), 'buttons must compress under pressure');
assert.ok(styles.controlMotion.includes('g-primary-charge'), 'primary controls must carry restrained charge');
assert.ok(styles.links.includes('background-size: 100% 100%'), 'links must reveal active energy');
assert.ok(styles.links.includes(':focus-visible'), 'links must preserve keyboard-visible focus');
assert.ok(styles.fields.includes('var(--g-control-field)'), 'fields must reject browser-default surfaces');
assert.ok(styles.fieldMotion.includes('input:-webkit-autofill'), 'autofill must preserve the visual language');
assert.ok(styles.fieldMotion.includes('forced-colors: active'), 'fields must preserve system contrast');
assert.ok(styles.choices.includes(':checked'), 'choices must reveal committed state');
assert.ok(styles.special.includes('::file-selector-button:hover'), 'file controls must carry hover energy');
assert.ok(styles.disclosures.includes('details[open]'), 'disclosures must reveal expanded state');
assert.ok(styles.disclosures.includes('dialog::backdrop'), 'dialogs must own the surrounding atmosphere');
assert.ok(styles.status.includes('g-status-flow'), 'progress must carry living current');
assert.ok(styles.status.includes('meter::-webkit-meter-suboptimum-value'), 'meters must reveal warning state');
assert.ok(styles.editable.includes('[contenteditable]'), 'editable regions must reject default surfaces');
assert.ok(styles.editable.includes(':focus'), 'editable regions must reveal focused authorship');
assert.ok(styles.controlMotion.includes('prefers-reduced-motion: reduce'), 'motion must remain reducible');
assert.ok(styles.status.includes('forced-colors: active'), 'status controls must preserve system contrast');
assert.ok(styles.editable.includes('forced-colors: active'), 'editable regions must preserve system contrast');

console.log('B"H interactionLanguageContract.test passed');
