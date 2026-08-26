//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creatureCompositionGraph.test.mjs
 * @description Proves generated anatomy may become the semantic source of later anatomy without mutating caller sources.
 * The Awtsmoos renews horn and feather in one ordered revelation, each new form becoming a lawful gate;
 * Awtsmoos.com tests that living composition remains deterministic while renderer concerns must wait.
 */

import assert from 'node:assert/strict';
import {
	CreatureComponentCompiler,
	createAnatomicalAttachmentFrame
} from '../src/core/animalMesh/creature/index.js';

const wallFrame = createAnatomicalAttachmentFrame({
	forward: [0, 0, 1],
	position: [2, 3, 4],
	source: { id: 'wall.face', kind: 'test-surface' },
	up: [0, 1, 0]
});
const initialSources = {
	guides: {},
	landmarks: { wall_origin: [2, 3, 4] },
	surfaceFrames: {}
};
const sourceSnapshot = structuredClone(initialSources);
const recipes = [
	{
		attach: { frame: wallFrame, mode: 'frame' },
		id: 'wall_horn',
		seed: 'composition-proof-horn',
		type: 'horn'
	},
	{
		attach: { guide: 'component.wall_horn', mode: 'guide' },
		id: 'wall_feather',
		seed: 'composition-proof-feather',
		type: 'feather'
	}
];
const quality = {
	longitudinalScale: 1,
	radialScale: 1
};
const compiler = new CreatureComponentCompiler();
const first = compiler.compile(recipes, initialSources, quality);
const second = compiler.compile(recipes, initialSources, quality);

assert.ok(first.guides.wall_horn_keratin);
assert.ok(first.guides.wall_feather_shaft);
assert.ok(first.guides.wall_feather_vane);
assert.equal(first.recipes.length, 2);
assert.equal(first.recipes[1].attach.targets[0], 'component.wall_horn');
assert.deepEqual(first, second);
assert.deepEqual(initialSources, sourceSnapshot);
assert.equal(Object.isFrozen(first), true);
assert.equal(Object.isFrozen(first.guides), true);

const explicitGuide = compiler.compile([
	recipes[0],
	{
		...recipes[1],
		attach: { guide: 'wall_horn_keratin', mode: 'guide' },
		id: 'explicit_feather'
	}
], initialSources, quality);
assert.ok(explicitGuide.guides.explicit_feather_shaft);

console.log('B"H | creatureCompositionGraph.test.mjs passed');
