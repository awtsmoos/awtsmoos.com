// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { updateDirector } from '../../js/director/director.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { MALCHUS_PROFILES } from '../../js/mechanics/malchusProfiles.js';
import {
	mechanicSummary,
	recordMechanicCapture,
	recordMechanicDefeat,
	updateMechanic
} from '../../js/mechanics/runtime.js';
import { createMechanicState } from '../../js/mechanics/state.js';
import { createWorld } from '../../js/state.js';

/**
 * Awtsmoos.com receives deterministic witnesses that profile data becomes behavior,
 * not merely labels painted over the same simulation.
 */
export function runMechanicCases() {
	return [
		checkMalchusProfiles(),
		checkChainCurrent(),
		checkMovingFeast(),
		checkFragileStreets(),
		checkLandmarkAwakening(),
		checkOrbHarvest()
	];
}

function checkMalchusProfiles() {
	const malchus = LEVELS.slice(0, 20);
	assert.equal(MALCHUS_PROFILES.length, 20);
	assert.equal(new Set(malchus.map(level => level.mechanicProfile.id)).size, 20);
	assert.ok(malchus.every(level => level.mechanicProfile.mechanic === level.mechanic));
	return { test: 'malchus-mechanic-profiles', profiles: malchus.length };
}

function checkChainCurrent() {
	const world = mechanicWorld('chain-current');
	const object = captureObject({ district: 'ES' });
	repeat(world.mechanic.profile.threshold, () => recordMechanicCapture(world, object));
	compose(world);
	assert.ok(world.mechanic.timer > 0);
	assert.ok(world.rules.attractionScale > 1);
	return result('chain-current', world);
}

function checkMovingFeast() {
	const world = mechanicWorld('moving-feast');
	const object = captureObject({ traffic: true, category: 'vehicle' });
	repeat(world.mechanic.profile.threshold, () => recordMechanicCapture(world, object));
	compose(world);
	assert.ok(world.rules.trafficSpeed > world.gameMode.trafficSpeed);
	return result('moving-feast', world);
}

function checkFragileStreets() {
	const world = mechanicWorld('fragile-streets');
	repeat(3, () => recordMechanicDefeat(world));
	compose(world);
	assert.ok(world.mechanic.stability < 0.45);
	assert.equal(world.rules.fragile, true);
	return result('fragile-streets', world);
}

function checkLandmarkAwakening() {
	const world = mechanicWorld('landmark-awakening');
	const object = captureObject({ category: 'landmark' });
	repeat(world.mechanic.profile.threshold, () => recordMechanicCapture(world, object));
	compose(world);
	assert.ok(world.rules.captureMass > world.gameMode.captureMass);
	return result('landmark-awakening', world);
}

function checkOrbHarvest() {
	const world = mechanicWorld('orb-harvest');
	const object = captureObject({ category: 'pickup', power: 'magnet' });
	repeat(world.mechanic.profile.threshold, () => recordMechanicCapture(world, object));
	compose(world);
	assert.ok(world.powerups.magnet > 0);
	assert.ok(world.rules.attractionScale > 1);
	return result('orb-harvest', world);
}

function mechanicWorld(mechanic) {
	const world = createWorld();
	const profile = MALCHUS_PROFILES.find(candidate => candidate.mechanic === mechanic);
	world.mechanic = createMechanicState({ mechanicProfile: profile });
	return world;
}

function captureObject(overrides = {}) {
	return {
		district: 'WN',
		category: 'small',
		traffic: false,
		power: null,
		...overrides
	};
}

function compose(world) {
	updateMechanic(world, 0);
	updateDirector(world, 0);
}

function repeat(count, operation) {
	for (let index = 0; index < count; index += 1) operation();
}

function result(test, world) {
	return { test, ...mechanicSummary(world), score: world.score };
}
