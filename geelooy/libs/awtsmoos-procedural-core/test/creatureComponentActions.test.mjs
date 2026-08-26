// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creatureComponentActions.test.mjs
 * @description Verifies that universal biological component actions remain renderer-neutral, immutable, root-exported, and preserved through the real component compiler.
 * The Awtsmoos renews both the place of a horn and the deed it intends to reveal; Awtsmoos.com tests that WHERE and WHAT remain distinct vessels while one deterministic compiler carries both without confusion.
 */

import assert from 'node:assert/strict';
import {
	CreatureComponentCompiler,
	createAnatomicalAttachmentFrame,
	createAnatomicalComponent,
	createCreatureComponentAction,
	creaturePhenotypeComponentMetadata,
	listCreatureComponentActionModes
} from '../src/index.js';

const expectedModes = [
	'attach',
	'replace',
	'blend',
	'wrap',
	'embed',
	'span',
	'scatter',
	'array',
	'mirror',
	'grow_along',
	'conform_to',
	'extrude_from',
	'inset_into'
];
assert.deepEqual(listCreatureComponentActionModes(), expectedModes);

const defaultFrame = createAnatomicalAttachmentFrame({
	forward: [0, 0, 1],
	position: [1, 2, 3],
	source: { id: 'wall.face', kind: 'test-surface' },
	up: [0, 1, 0]
});
const defaultComponent = createAnatomicalComponent({
	attach: { frame: defaultFrame, mode: 'frame' },
	type: 'horn'
});
assert.equal(defaultComponent.action.mode, 'attach');

const growthAction = createCreatureComponentAction({
	attachmentDepth: 0.04,
	growthDirection: [0, 1, 0],
	inheritMaterial: true,
	mode: 'grow-along',
	surfaceConform: true
});
assert.equal(growthAction.mode, 'grow_along');
assert.deepEqual(growthAction.growthDirection, [0, 1, 0]);
assert.equal(Object.isFrozen(growthAction), true);
assert.throws(
	() => createCreatureComponentAction('teleport_into'),
	/Unsupported creature component action/
);

const compiler = new CreatureComponentCompiler();
const compiled = compiler.compile([
	{
		action: {
			attachmentDepth: 0.03,
			blendInto: 'wall.surface',
			inheritMaterial: true,
			mode: 'replace',
			replaceRegion: 'wall.face'
		},
		attach: { frame: defaultFrame, mode: 'frame', region: 'wall.face' },
		id: 'wall_horn',
		seed: 'component-action-proof',
		type: 'horn'
	}
], {}, {
	longitudinalScale: 1,
	radialScale: 1
});

assert.equal(Object.keys(compiled.guides).length > 0, true);
assert.equal(compiled.recipes.length, 1);
assert.equal(compiled.recipes[0].action.mode, 'replace');
assert.equal(compiled.actionIntents.length, 1);
const intent = compiled.actionIntents[0];
assert.equal(intent.componentId, 'wall_horn');
assert.equal(intent.action.mode, 'replace');
assert.equal(intent.action.replaceRegion, 'wall.face');
assert.equal(intent.action.blendInto, 'wall.surface');
assert.equal(intent.action.inheritMaterial, true);
assert.equal(intent.placement.mode, 'frame');
assert.equal(intent.placement.region, 'wall.face');
assert.deepEqual(intent.frames[0].position, [1, 2, 3]);
assert.equal(Object.isFrozen(intent.frames[0]), true);

const metadata = creaturePhenotypeComponentMetadata({
	actionIntents: compiled.actionIntents
});
assert.deepEqual(metadata.component_action_intents, compiled.actionIntents);
assert.equal(Object.isFrozen(metadata.component_action_intents), true);

console.log('B"H | creatureComponentActions.test.mjs passed');
