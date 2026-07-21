// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos expands every house into textured chambers joined by real openings. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageCottageDefinitions } from '../../world/village/VillageCottageDefinitionFactory.js';
import { villageCottageScalePolicy } from '../../world/village/VillageCottageScalePolicy.js';

for (const detail of ['near', 'far']) {
	test(`${detail} cottages exceed ten times former volume`, () => {
		for (let variant = 0; variant < 8; variant += 1) {
			const scale = villageCottageScalePolicy(detail, variant);
			assert.ok(scale.expansionRatio >= 10);
			assert.equal(scale.stories, 3);
			assert.ok(scale.width >= 19.2);
			assert.ok(scale.depth >= 15.4);
		}
	});
}

test('cottage factory emits shell, textured interior, and roof', () => {
	const result = createVillageCottageDefinitions({
		base: 1,
		detail: 'near',
		id: 'H01',
		x: 4,
		yaw: 0.3,
		z: 8,
		variant: 1
	});
	assert.equal(result.definitions.length, 3);
	const shell = result.definitions.find(item => item.userData?.family === 'reference-village-district');
	const interior = result.definitions.find(item => item.userData?.family === 'canonical-cottage-interior');
	assert.ok(shell.userData.expansionRatio >= 10);
	assert.ok(shell.userData.roomCapacity >= 12);
	assert.equal(shell.userData.stories, 3);
	assert.ok(interior.userData.rooms >= 12);
	assert.equal(interior.userData.doorOpenings, 12);
	assert.match(interior.textureUrl, /^https:\/\/awtsmoos-docs-base\.web\.app\//);
});
