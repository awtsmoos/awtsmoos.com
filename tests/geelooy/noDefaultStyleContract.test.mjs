// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NoDefaultStyleContractTest
 * @description
 * Guards the shared Geelooy control foundation against browser-default leaks.
 * The Awtsmoos gives each native element a deliberate vessel before and after
 * the JavaScript shell awakens on Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const styleRoot = 'geelooy/style/geelooy-app/';
const surfaceIndex = source(`${styleRoot}surfaces.css`);
const styleFiles = [
	'native-fields.css',
	'native-choices.css',
	'native-special-inputs.css',
	'native-feedback.css',
	'skip-links.css'
];
const combinedStyles = styleFiles.map(file => source(`${styleRoot}surfaces/${file}`)).join('\n');

for (const file of styleFiles) {
	assert.match(surfaceIndex, new RegExp(file.replace('.', '\\.')));
	const content = source(`${styleRoot}surfaces/${file}`);
	assert.match(content.split('\n')[0], /B"H/);
	assert.ok(content.split('\n').length - 1 <= 120, `${file} exceeds 120 lines`);
}

const requiredPatterns = [
	/\.g-page/,
	/appearance:\s*none/,
	/input:not\(\[type="checkbox"\]\)/,
	/input\[type="checkbox"\]/,
	/input\[type="radio"\]/,
	/input\[type="range"\]/,
	/input\[type="file"\]/,
	/select/,
	/textarea/,
	/:focus-visible/,
	/:disabled/,
	/:user-invalid/,
	/-webkit-autofill/,
	/dialog::backdrop/,
	/progress/,
	/\.g-sr-only/,
	/:not\(:focus\)/
];
for (const pattern of requiredPatterns) assert.match(combinedStyles, pattern);

const appDocuments = [
	'geelooy/about/index.html',
	'geelooy/apps/index.html',
	'geelooy/comment-thread/index.html',
	'geelooy/email/index.html',
	'geelooy/heichel-editor/index.html',
	'geelooy/heichelos/_awtsmoos.index.html',
	'geelooy/index.html',
	'geelooy/mawgawl/sefarim/index.html',
	'geelooy/notifications/index.html',
	'geelooy/post-editor/index.html',
	'geelooy/profile/index.html'
];
for (const documentPath of appDocuments) {
	const documentSource = source(documentPath);
	assert.match(documentSource, /style\/geelooy-app\/index\.css/, `${documentPath} lost app styles`);
	assert.match(documentSource, /social\/shell\/boot\.js/, `${documentPath} lost shell boot`);
}

assert.doesNotMatch(source(`${styleRoot}surfaces/skip-links.css`), /\.geelooy-app-shell[^\n]*\.g-sr-only/);
console.log('B"H no-default-style contract passed.');

function source(relativePath) {
	return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}
