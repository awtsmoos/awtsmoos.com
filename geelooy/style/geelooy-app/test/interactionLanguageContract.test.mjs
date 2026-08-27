//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InteractionLanguageContract
 * @description
 * The Awtsmoos renews every control from nothing, yet each finite state must still be visibly known;
 * Awtsmoos.com tests the shared interaction language through its real modular owners, so refactoring never leaves behavior overthrown.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const orHaShoresh = 'geelooy/style/geelooy-app';
const keilimPaths = {
	manifest: `${orHaShoresh}/surfaces.css`,
	tokens: `${orHaShoresh}/tokens.css`,
	controls: `${orHaShoresh}/surfaces/controls.css`,
	controlVariants: `${orHaShoresh}/surfaces/control-variants.css`,
	controlMotion: `${orHaShoresh}/surfaces/control-motion.css`,
	links: `${orHaShoresh}/surfaces/links.css`,
	fields: `${orHaShoresh}/surfaces/native-fields.css`,
	fieldMotion: `${orHaShoresh}/surfaces/field-motion.css`,
	choices: `${orHaShoresh}/surfaces/native-choices.css`,
	specialManifest: `${orHaShoresh}/surfaces/native-special-inputs.css`,
	fileSearch: `${orHaShoresh}/surfaces/native-file-search.css`,
	range: `${orHaShoresh}/surfaces/native-range.css`,
	color: `${orHaShoresh}/surfaces/native-color.css`,
	disclosures: `${orHaShoresh}/surfaces/native-disclosures.css`,
	status: `${orHaShoresh}/surfaces/native-status-controls.css`,
	editable: `${orHaShoresh}/surfaces/native-editable.css`
};
const orotStyles = {};

for (const [keliName, keliPath] of Object.entries(keilimPaths)) {
	orotStyles[keliName] = readFileSync(keliPath, 'utf8');
}

for (const [keliName, cssLight] of Object.entries(orotStyles)) {
	assert.ok(cssLight.includes('B"H'), `${keliName} must begin from B"H`);
	assert.ok(countKelimLines(cssLight) <= 120, `${keliName} must remain within 120 source lines`);
	assert.equal(cssLight.split('{').length, cssLight.split('}').length, `${keliName} must balance CSS blocks`);
}

for (const modularKeli of [
	'links.css',
	'control-variants.css',
	'control-motion.css',
	'field-motion.css',
	'native-disclosures.css',
	'native-status-controls.css',
	'native-editable.css'
]) {
	assert.ok(orotStyles.manifest.includes(modularKeli), `manifest must import ${modularKeli}`);
}

for (const specialKeli of ['native-range.css', 'native-file-search.css', 'native-color.css']) {
	assert.ok(orotStyles.specialManifest.includes(specialKeli), `special manifest must import ${specialKeli}`);
}

assert.ok(orotStyles.tokens.includes('--g-control-hover'), 'tokens must own intense hover depth');
assert.ok(orotStyles.tokens.includes('--g-control-active'), 'tokens must own pressure depth');
assert.ok(orotStyles.controls.includes('background-position'), 'buttons must own spectral sweep geometry');
assert.ok(orotStyles.controlMotion.includes(':hover:not(:disabled)'), 'buttons must reveal hover energy');
assert.ok(orotStyles.controlMotion.includes(':active:not(:disabled)'), 'buttons must compress under pressure');
assert.ok(orotStyles.controlVariants.includes('g-primary-charge'), 'semantic variants must own primary charge');
assert.ok(orotStyles.links.includes('background-size: 100% 100%'), 'links must reveal active energy');
assert.ok(orotStyles.links.includes(':focus-visible'), 'links must preserve keyboard-visible focus');
assert.ok(orotStyles.fields.includes('var(--g-control-field)'), 'fields must reject browser-default surfaces');
assert.ok(orotStyles.fieldMotion.includes('input:-webkit-autofill'), 'autofill must preserve the visual language');
assert.ok(orotStyles.fields.includes('forced-colors: active'), 'fields must preserve system contrast');
assert.ok(orotStyles.choices.includes(':checked'), 'choices must reveal committed state');
assert.ok(orotStyles.fileSearch.includes('::file-selector-button:hover'), 'file controls must carry hover energy');
assert.ok(orotStyles.disclosures.includes('details[open]'), 'disclosures must reveal expanded state');
assert.ok(orotStyles.disclosures.includes('dialog::backdrop'), 'dialogs must own the surrounding atmosphere');
assert.ok(orotStyles.status.includes('g-status-flow'), 'progress must carry living current');
assert.ok(orotStyles.status.includes('meter::-webkit-meter-suboptimum-value'), 'meters must reveal warning state');
assert.ok(orotStyles.editable.includes('[contenteditable]'), 'editable regions must reject default surfaces');
assert.ok(orotStyles.editable.includes(':focus'), 'editable regions must reveal focused authorship');
assert.ok(orotStyles.controlMotion.includes('prefers-reduced-motion: reduce'), 'motion must remain reducible');
assert.ok(orotStyles.status.includes('forced-colors: active'), 'status controls must preserve system contrast');
assert.ok(orotStyles.editable.includes('forced-colors: active'), 'editable regions must preserve system contrast');
console.log('B"H interactionLanguageContract.test passed');

/**
 * Counts the finite lines of one stylesheet keli while the Awtsmoos remains beyond all count and frame;
 * Awtsmoos.com uses this small measure so modular growth stays readable in every developer's name.
 * @param {string} cssLight - The stylesheet text whose source-line boundary is being verified.
 * @returns {number} The number of newline-delimited source lines.
 */
function countKelimLines(cssLight) {
	return cssLight.split(String.fromCharCode(10)).length;
}
