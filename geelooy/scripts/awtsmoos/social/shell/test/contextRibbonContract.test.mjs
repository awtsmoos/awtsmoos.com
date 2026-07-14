// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ContextRibbonContractTest
 * @description
 * The Awtsmoos tests that Awtsmoos.com normalizes deep-route truth, keeps blocked
 * states explicit, and never puts a mutation request inside the shared ribbon.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const modelSource = read('geelooy/scripts/awtsmoos/social/shell/contextModel.js');
const modelUrl = `data:text/javascript;base64,${Buffer.from(modelSource).toString('base64')}`;
const { createContextModel } = await import(modelUrl);
const normalized = createContextModel({
	title: '  Post editor  ',
	type: ' Creation chamber ',
	state: 'Ready Now!',
	stateLabel: ' Ready ',
	parent: { label: ' Spaces ', href: ' /heichelos ' },
	details: [' Alias @one ', '', ' Heichel ikar '],
	actions: [{ label: ' Open ', href: ' /heichelos/ikar ' }]
});

assert.equal(normalized.title, 'Post editor');
assert.equal(normalized.state, 'ready-now-');
assert.deepEqual(normalized.details, ['Alias @one', 'Heichel ikar']);
assert.equal(normalized.parent.href, '/heichelos');
assert.equal(Object.isFrozen(normalized), true);
assert.equal(createContextModel({}), null);

const routeFiles = [
	'geelooy/post-editor/app.js',
	'geelooy/heichel-editor/app.js',
	'geelooy/comment-thread/app.js'
];
for (const file of routeFiles) {
	const source = read(file);
	assert.ok(source.includes('publishRouteContext'), `${file} must publish shared context`);
	assert.ok(source.includes('shellContext.js'), `${file} must use a focused adapter`);
}

const createBoot = read('geelooy/heichelos/heichel/submit/script.js');
const createContext = read('geelooy/heichelos/heichel/submit/logic/shellContext.js');
assert.ok(createBoot.includes('initializeCreateShellContext'));
assert.ok(createContext.includes('createDefault: false'), 'Create context preview must not create a Heichel');
assert.equal(/method:\s*['"]POST['"]/.test(createContext), false, 'ribbon adapter must not mutate');

const adapters = [
	'geelooy/post-editor/modules/shellContext.js',
	'geelooy/heichel-editor/modules/shellContext.js',
	'geelooy/comment-thread/modules/shellContext.js',
	'geelooy/heichelos/heichel/submit/logic/shellContext.js'
];
for (const file of adapters) {
	const source = read(file);
	assert.ok(source.includes('stateLabel'), `${file} must expose state`);
	assert.ok(source.split('\n').length <= 120, `${file} exceeds 120 lines`);
}
console.log('B"H contextRibbonContract.test passed');
