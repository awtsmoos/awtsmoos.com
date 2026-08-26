// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityProgressiveDisclosure.test.mjs
 * @description Proves the one-line Reality doorway and its real advanced authorities remain one coherent contract.
 * The Awtsmoos renews simple intention and expert depth before either can claim a separate source;
 * Awtsmoos.com tests that matter, architecture, objects, catalogs, and inherited compatibility all travel one canonical course.
 */
import assert from 'node:assert/strict';
import {
	RealityLivingApiBase,
	RealityMatterApiBase,
	createRealityApi
} from '../src/core/reality/index.js';

const reality = createRealityApi({ seed: 613 });

assert.equal(reality instanceof RealityMatterApiBase, true);
assert.equal(reality instanceof RealityLivingApiBase, true);
assert.equal(Object.isFrozen(reality.advanced), true);
assert.equal(typeof reality.advanced.nature.water.pond, 'function');
assert.equal(typeof reality.advanced.chai.population, 'function');
assert.equal(typeof reality.advanced.medaber.human, 'function');
assert.equal(typeof reality.advanced.buildings.create, 'function');
assert.equal(typeof reality.advanced.objects.createRecipe, 'function');
assert.equal(typeof reality.advanced.objects.compile, 'function');
assert.equal(typeof reality.advanced.domem.primitive, 'function');

const primitive = reality.primitive('cube');
const geometry = reality.geometry('cube');
assert.deepEqual(geometry, primitive);

const building = reality.building({
	depth: 5,
	id: 'small-house',
	width: 6
});
assert.equal(typeof building, 'object');
assert.ok(Object.keys(building).length > 0);

const house = reality.house({
	depth: 5,
	id: 'small-house-alias',
	width: 6
});
assert.equal(typeof house, 'object');

const material = reality.material('stone.general');
assert.equal(typeof material, 'object');
assert.equal(Object.isFrozen(material), true);

const recipe = reality.objectRecipe({ commands: [] });
assert.ok(Array.isArray(recipe.commands));
assert.equal(recipe.commands.length, 0);

const catalog = reality.catalog();
assert.equal(Object.isFrozen(catalog), true);
assert.ok(catalog.records.length > 0);
assert.ok(catalog.primitives.includes('cube'));
for (const record of catalog.records) {
	if (record.easyMethod) {
		assert.equal(typeof reality[record.easyMethod], 'function', record.easyMethod);
	}
	assert.ok(record.advancedPath || record.advancedExports);
}

const waterCatalog = reality.catalog('water');
assert.ok(waterCatalog.records.length > 0);
assert.ok(waterCatalog.records.every((record) => record.domain.includes('water')));

const derived = reality.with({ seed: 917 });
assert.notEqual(derived, reality);
assert.notEqual(derived.advanced, reality.advanced);
assert.equal(derived.defaults.seed, 917);

console.log('B"H | realityProgressiveDisclosure.test passed');
