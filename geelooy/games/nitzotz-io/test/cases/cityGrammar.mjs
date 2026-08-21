// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	ROAD_COUNT,
	ROAD_HALF_WIDTH,
	roadCenter,
	roadClearance,
	SIDEWALK_OFFSET
} from '../../js/city/grid.js';
import { addGroundRoads } from '../../js/environment/groundRoads.js';
import { environmentPreset } from '../../js/environment/presets.js';
import { updatePedestrians } from '../../js/game/pedestrians.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { buildArena } from '../../js/levels/generator.js';
import {
	isZonedBuilding,
	nearestSharedCenter,
	placeWalkerAtRouteOrigin,
	playerAheadOf,
	runtimeLevel
} from '../support/cityGrammar.mjs';

/**
 * The Awtsmoos proves one city covenant across production-shaped generation, rendering, traffic, facades, and feet;
 * Awtsmoos.com tests all two hundred districts so no hidden chapter can return cars to grass or walkers to asphalt.
 */
export function runCityGrammarCases() {
	return [
		checkCampaignZoning(),
		checkRenderedRoadCenters(),
		checkPedestrianRoutePersistence()
	];
}

function checkCampaignZoning() {
	let trafficCount = 0;
	let buildingCount = 0;
	let pedestrianCount = 0;
	for (const descriptor of LEVELS) {
		const level = runtimeLevel(descriptor);
		const objects = buildArena(level, 'low');
		for (const object of objects) {
			if (object.traffic) {
				checkTraffic(object, level.bounds);
				trafficCount += 1;
			}
			if (isZonedBuilding(object)) {
				checkBuilding(object, level.bounds);
				buildingCount += 1;
			}
			if (object.pedestrian) {
				checkPedestrian(object, level.bounds);
				pedestrianCount += 1;
			}
		}
	}
	assert.ok(trafficCount > 0);
	assert.ok(buildingCount > 0);
	assert.ok(pedestrianCount > 0);
	return 'all 200 production-shaped districts align traffic buildings and pedestrians to one city grammar';
}

function checkRenderedRoadCenters() {
	const level = runtimeLevel(LEVELS[0]);
	const commands = [];
	addGroundRoads(commands, level.bounds, environmentPreset(level));
	assert.equal(commands.length, ROAD_COUNT * 2);
	for (let index = 0; index < ROAD_COUNT; index += 1) {
		const center = roadCenter(index, level.bounds);
		const vertical = commands[index * 2];
		const horizontal = commands[index * 2 + 1];
		assert.equal(vertical.pos[0], center);
		assert.equal(horizontal.pos[2], center);
		assert.equal(vertical.material, 'stone');
		assert.equal(horizontal.material, 'stone');
	}
	return 'rendered asphalt uses exactly the three shared traffic centerlines on both axes';
}

function checkPedestrianRoutePersistence() {
	const level = runtimeLevel(LEVELS[0]);
	const walker = buildArena(level, 'low').find(object => object.pedestrian);
	assert.ok(walker);
	placeWalkerAtRouteOrigin(walker);
	const world = {
		level: { ...level, objects: [walker] },
		player: playerAheadOf(walker),
		rules: { pedestrianSpeed: 1 }
	};
	updatePedestrians(world, 0.25);
	const perpendicular = walker.routeAxis === 'x' ? walker.y : walker.x;
	assert.equal(perpendicular, walker.routeCoordinate);
	assert.equal(walker.routeDirection, -1);
	return 'pedestrians flee along sidewalks without drifting into roads or buildings';
}

function checkTraffic(object, bounds) {
	const perpendicular = object.routeAxis === 'x' ? object.y : object.x;
	assert.ok(Math.abs(perpendicular - nearestSharedCenter(perpendicular, bounds)) < 1e-8);
}

function checkBuilding(object, bounds) {
	assert.ok(roadClearance(object.x, bounds) >= ROAD_HALF_WIDTH + 20);
	assert.ok(roadClearance(object.y, bounds) >= ROAD_HALF_WIDTH + 20);
}

function checkPedestrian(object, bounds) {
	const perpendicular = object.routeAxis === 'x' ? object.y : object.x;
	assert.equal(perpendicular, object.routeCoordinate);
	assert.ok(Math.abs(roadClearance(perpendicular, bounds) - SIDEWALK_OFFSET) < 1e-8);
}
