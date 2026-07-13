// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CreateNavigationContractTest
 * @description
 * The Awtsmoos verifies one global navigation owner at Awtsmoos.com while Create
 * preserves mature composer nodes, previews destination, and clears the dock.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const templateFile = 'geelooy/heichelos/_awtsmoos.submitToHeichel.html';
const base = 'geelooy/heichelos/heichel/submit';
const source = readFileSync(templateFile, 'utf8');
const boot = readFileSync(`${base}/script.js`, 'utf8');
const context = readFileSync(`${base}/logic/shellContext.js`, 'utf8');
const overrides = readFileSync(`${base}/shell-overrides.css`, 'utf8');
const requiredIds = [
	'backBtn',
	'title',
	'aliasId',
	'postId',
	'contentType',
	'mainContentEditor',
	'sectionsArea',
	'toolbarTemplate',
	'sectionTemplate',
	'subSectionTemplate',
	'imageUploadModal',
	'submitPost'
];

assert.equal((source.match(/rel="stylesheet"/g) || []).length, 2, 'Create needs local styles and one shell override');
assert.ok(source.includes('shell-overrides.css?v=create-005'), 'dock-safe Create override must load after local styles');
assert.equal((source.match(/social\/shell\/boot\.js/g) || []).length, 1, 'Create needs one shell boot');
assert.equal(source.includes('nav/header.html'), false, 'server header must not duplicate the shell');
assert.equal(source.includes('mobile-create-nav'), false, 'custom mobile navigation must be removed');
assert.equal(source.includes('navigation/appNavigation.js'), false, 'shell boot owns optional navigation enhancement');
assert.equal((source.match(/<nav\b/g) || []).length, 0, 'route template must not own global navigation');
for (const id of requiredIds) assert.ok(source.includes(`id="${id}"`), `Create route missing required #${id}`);
assert.ok(source.includes('/heichelos/heichel/submit/script.js'), 'mature composer script must remain connected');
assert.ok(boot.includes('initializeCreateShellContext'), 'Create boot must publish destination context');
assert.ok(context.includes('createDefault: false'), 'context preview must not create a Heichel');
assert.equal(/method:\s*['"]POST['"]/.test(context), false, 'context adapter must not mutate');
assert.ok(overrides.includes('var(--g-dock-h)'), 'publish action must clear the canonical dock');
assert.ok(overrides.includes('data-g-context-visible'), 'override must activate only with shared context');
for (const [name, text] of Object.entries({ source, boot, context, overrides })) {
	assert.ok(text.split('\n').length <= 120, `${name} exceeds 120 lines`);
}
console.log('B"H createNavigationContract.test passed');
