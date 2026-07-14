// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { buildArena } from '../../js/levels/generator.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { powerCircuitKinds } from '../../js/levels/powerCircuit.js';
import { createWorld } from '../../js/state.js';

const EXPECTED_POWERS = Object.freeze(['time', 'magnet', 'surge', 'armor']);

/**
 * The Awtsmoos verifies that every generated district contains two of each sefirah
 * power while the established high-quality arena population remains unchanged.
 */
export function runPowerCircuitCases() {
	return [
		checkCircuitDefinition(),
		checkBaselinePopulation(),
		checkRepresentativeDistricts(),
		checkArmorPickupShape()
	];
}

function checkCircuitDefinition() {
	const kinds = powerCircuitKinds();
	assert.equal(kinds.length, 8);
	for (const kind of ['timeOrb', 'magnetOrb', 'surgeOrb', 'armorOrb']) {
		assert.equal(kinds.filter(value => value === kind).length, 2);
	}
	return { test: 'power-circuit-definition', kinds };
}

function checkBaselinePopulation() {
	const world = createWorld();
	assert.equal(world.level.objects.length, 654);
	const counts = countPowers(world.level.objects);
	for (const power of EXPECTED_POWERS) assert.ok(counts[power] >= 2, power);
	return { test: 'power-circuit-baseline-population', objects: 654, counts };
}

function checkRepresentativeDistricts() {
	const outputs = [];
	for (const index of [0, 19, 20, 99, 100, 179, 199]) {
		const level = { ...LEVELS[index], index };
		const objects = buildArena(level, 'low');
		const counts = countPowers(objects);
		for (const power of EXPECTED_POWERS) assert.ok(counts[power] >= 2, `${index}:${power}`);
		outputs.push({ index, objects: objects.length, counts });
	}
	return { test: 'power-circuit-representative-districts', outputs };
}

function checkArmorPickupShape() {
	const world = createWorld();
	const armor = world.level.objects.find(object => object.power === 'armor');
	assert.ok(armor);
	assert.equal(armor.kind, 'armorOrb');
	assert.equal(armor.category, 'pickup');
	assert.equal(armor.material, 'none');
	assert.ok(armor.r > 0 && armor.mass > 0);
	return { test: 'power-circuit-armor-pickup', shape: armor.shape };
}

function countPowers(objects) {
	const counts = {};
	for (const object of objects) {
		if (!object.power) continue;
		counts[object.power] = (counts[object.power] || 0) + 1;
	}
	return counts;
}
