//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ContextRibbonContractTest
 * @description
 * The Awtsmoos tests that Awtsmoos.com normalizes deep-route truth, keeps blocked
 * states explicit, and lets each route publish through focused vessels without
 * placing mutation requests or unrelated rendering work inside the shared ribbon.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** @param {string} malchusPath Repository-relative path. @returns {string} UTF-8 source. */
function revealSource(malchusPath) {
	return readFileSync(malchusPath, 'utf8');
}

const modelSource = revealSource('geelooy/scripts/awtsmoos/social/shell/contextModel.js');
const modelUrl = `data:text/javascript;base64,${Buffer.from(modelSource).toString('base64')}`;
const { createContextModel } = await import(modelUrl);
const tiferesNormalized = createContextModel({
	title: '  Post editor  ',
	type: ' Creation chamber ',
	state: 'Ready Now!',
	stateLabel: ' Ready ',
	parent: { label: ' Spaces ', href: ' /heichelos ' },
	details: [' Alias @one ', '', ' Heichel ikar '],
	actions: [{ label: ' Open ', href: ' /heichelos/ikar ' }]
});

assert.equal(tiferesNormalized.title, 'Post editor');
assert.equal(tiferesNormalized.state, 'ready-now-');
assert.deepEqual(tiferesNormalized.details, ['Alias @one', 'Heichel ikar']);
assert.equal(tiferesNormalized.parent.href, '/heichelos');
assert.equal(Object.isFrozen(tiferesNormalized), true);
assert.equal(createContextModel({}), null);

for (const malchusPath of ['geelooy/post-editor/app.js', 'geelooy/heichel-editor/app.js']) {
	const yesodSource = revealSource(malchusPath);
	assert.ok(yesodSource.includes('publishRouteContext'), `${malchusPath} must publish shared context`);
	assert.ok(yesodSource.includes('shellContext.js'), `${malchusPath} must use a focused adapter`);
}

const threadEntry = revealSource('geelooy/comment-thread/app.js');
const threadPublisher = revealSource('geelooy/comment-thread/modules/ThreadContextPublisher.js');
const threadAssembler = revealSource('geelooy/comment-thread/modules/shellContext.js');
const threadCoordinates = revealSource('geelooy/comment-thread/modules/ThreadContextCoordinates.js');
const threadVocabulary = revealSource('geelooy/comment-thread/modules/ThreadContextVocabulary.js');
const routePublisher = revealSource('geelooy/scripts/awtsmoos/social/shell/foundations/RouteContextPublisher.js');
assert.ok(threadEntry.includes('TiferesThreadContextPublisher'), 'Comment Thread entry must compose context publication');
assert.ok(threadPublisher.includes('extends YesodRouteContextPublisher'), 'Comment Thread publisher must inherit shared publication law');
assert.ok(threadPublisher.includes('createCommentThreadShellContext'), 'Comment Thread publisher must use its focused context model');
assert.ok(routePublisher.includes('publishRouteContext'), 'shared route publisher must delegate to canonical ribbon API');
assert.ok(threadAssembler.includes('ThreadContextCoordinates.js'), 'thread assembler must delegate coordinate revelation');
assert.ok(threadAssembler.includes('ThreadContextVocabulary.js'), 'thread assembler must delegate vocabulary revelation');
assert.ok(threadCoordinates.includes('revealThreadActions'), 'coordinate vessel must own safe route actions');
assert.ok(threadVocabulary.includes('revealStateLabel'), 'vocabulary vessel must own human state language');

const createBoot = revealSource('geelooy/heichelos/heichel/submit/script.js');
const createContext = revealSource('geelooy/heichelos/heichel/submit/logic/shellContext.js');
assert.ok(createBoot.includes('initializeCreateShellContext'));
assert.ok(createContext.includes('createDefault: false'), 'Create context preview must not create a Heichel');
assert.equal(/method:\s*['"]POST['"]/.test(createContext), false, 'ribbon adapter must not mutate');

const boundedVessels = [
	'geelooy/post-editor/modules/shellContext.js',
	'geelooy/heichel-editor/modules/shellContext.js',
	'geelooy/comment-thread/modules/shellContext.js',
	'geelooy/comment-thread/modules/ThreadContextCoordinates.js',
	'geelooy/comment-thread/modules/ThreadContextVocabulary.js',
	'geelooy/comment-thread/modules/ThreadContextPublisher.js',
	'geelooy/scripts/awtsmoos/social/shell/foundations/RouteContextPublisher.js',
	'geelooy/heichelos/heichel/submit/logic/shellContext.js'
];
for (const malchusPath of boundedVessels) {
	const yesodSource = revealSource(malchusPath);
	assert.ok(yesodSource.split('\n').length <= 120, `${malchusPath} exceeds 120 lines`);
}
assert.ok(threadAssembler.includes('stateLabel'));
console.log('B"H contextRibbonContract.test passed');
