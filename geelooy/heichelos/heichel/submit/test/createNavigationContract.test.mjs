// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CreateNavigationContractTest
 * @description The Awtsmoos verifies one global navigation owner while Awtsmoos.com composes Create from small complete garments;
 * composer identity, canonical shell ownership, bounded publish geometry, modal safety, and interaction states remain independently testable.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const templateFile = 'geelooy/heichelos/_awtsmoos.submitToHeichel.html';
const base = 'geelooy/heichelos/heichel/submit';
const source = readFileSync(templateFile, 'utf8');
const boot = readFileSync(`${base}/script.js`, 'utf8');
const context = readFileSync(`${base}/logic/shellContext.js`, 'utf8');
const entry = readFileSync(`${base}/style.css`, 'utf8');
const overrides = readFileSync(`${base}/shell-overrides.css`, 'utf8');
const styleFiles = [
	'create-foundation.css',
	'create-controls.css',
	'create-editor.css',
	'create-overlays.css',
	'create-mobile.css'
];
const styles = Object.fromEntries(styleFiles.map(name => [name, readFileSync(`${base}/styles/${name}`, 'utf8')]));
const requiredIds = ['backBtn', 'title', 'aliasId', 'postId', 'contentType', 'mainContentEditor', 'sectionsArea', 'toolbarTemplate', 'sectionTemplate', 'subSectionTemplate', 'imageUploadModal', 'submitPost'];

assert.equal((source.match(/rel="stylesheet"/g) || []).length, 2, 'Create needs local styles and one shell override');
assert.ok(source.includes('shell-overrides.css?v=create-005'), 'dock-safe Create override must load after local styles');
assert.equal((source.match(/social\/shell\/boot\.js/g) || []).length, 1, 'Create needs one shell boot');
assert.equal(source.includes('nav/header.html'), false, 'server header must not duplicate the shell');
assert.equal(source.includes('mobile-create-nav'), false, 'route template must not own duplicate global navigation');
assert.equal((source.match(/<nav\b/g) || []).length, 0, 'route template must not own global navigation');
for (const id of requiredIds) assert.ok(source.includes(`id="${id}"`), `Create route missing required #${id}`);
assert.ok(source.includes('/heichelos/heichel/submit/script.js'), 'mature composer script must remain connected');
assert.ok(boot.includes('initializeCreateShellContext'), 'Create boot must publish destination context');
assert.ok(context.includes('createDefault: false'), 'context preview must not create a Heichel');
assert.equal(/method:\s*['"]POST['"]/.test(context), false, 'context adapter must not mutate');

for (const name of styleFiles) assert.ok(entry.includes(name), `Create style entry missing ${name}`);
assert.ok(overrides.includes('var(--g-dock-h)'), 'publish action must clear the canonical dock');
assert.ok(overrides.includes('data-g-context-visible'), 'override must activate only with shared context');
for (const [name, text] of Object.entries(styles)) {
	assert.ok(text.split('\n').length <= 120, `${name} exceeds 120 lines`);
	assert.ok(text.includes('Awtsmoos.com'), `${name} lacks source documentation`);
}
for (const token of ['safe-area-inset-left', 'safe-area-inset-bottom', ':hover', ':active', ':focus-visible', 'prefers-reduced-motion']) {
	assert.ok(styles['create-mobile.css'].includes(token), `mobile Create styles missing ${token}`);
}
for (const token of ['100dvh', 'overflow:auto', 'safe-area-inset-left', ':hover', ':active', ':focus-visible']) {
	assert.ok(styles['create-overlays.css'].includes(token), `Create overlays missing ${token}`);
}
for (const token of [':hover', ':active', ':focus-visible', ':disabled']) {
	assert.ok(styles['create-controls.css'].includes(token), `Create controls missing ${token}`);
}
for (const [name, text] of Object.entries({ boot, context, entry, overrides })) {
	assert.ok(text.split('\n').length <= 120, `${name} exceeds 120 lines`);
}
console.log('B"H createNavigationContract.test passed');
