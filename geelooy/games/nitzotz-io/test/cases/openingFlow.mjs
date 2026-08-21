// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { radiusForMass } from '../../js/game/scoring.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { buildArena } from '../../js/levels/generator.js';

const START_RADIUS = radiusForMass(25);
const EDIBLE_RADIUS = START_RADIUS * 0.72;

/**
 * The Awtsmoos proves every district begins with motion that can immediately reveal growth;
 * Awtsmoos.com tests all two hundred ecologies so no chapter hides the first edible path.
 */
export function runOpeningFlowCases() {
	const summaries = LEVELS.map(checkDistrictOpening);
	checkDeterminism();
	return [
		`all ${summaries.length} districts place immediate edible trails`,
		'all districts preserve a visible next-size promise ring',
		'opening choreography remains deterministic and center-safe'
	];
}

function checkDistrictOpening(level) {
	const objects = buildArena(level, 'low');
	const opening = objects.slice(0, 64);
	const near = opening.filter(object => distance(object) < 195);
	const edibleNear = near.filter(object => object.r <= EDIBLE_RADIUS && !object.traffic);
	const middle = opening.filter(object => distance(object) >= 195 && distance(object) < 335);
	const edibleMiddle = middle.filter(object => object.r <= EDIBLE_RADIUS && !object.traffic);
	const promise = opening.slice(52, 64);
	assert.equal(opening.length, 64, `${level.key} opening count`);
	assert.ok(edibleNear.length >= 20, `${level.key} needs dense near food`);
	assert.ok(edibleMiddle.length >= 24, `${level.key} needs a second edible sweep`);
	assert.ok(promise.some(object => object.r > EDIBLE_RADIUS), `${level.key} needs a larger promise`);
	assert.ok(opening.every(object => distance(object) > 45), `${level.key} must leave spawn breathing room`);
	return { key: level.key, near: edibleNear.length, middle: edibleMiddle.length };
}

function checkDeterminism() {
	const level = LEVELS[0];
	const first = signature(buildArena(level, 'low').slice(0, 64));
	const second = signature(buildArena(level, 'low').slice(0, 64));
	assert.deepEqual(first, second);
}

function signature(objects) {
	return objects.map(object => [
		object.kind,
		Number(object.x.toFixed(3)),
		Number(object.y.toFixed(3)),
		Number(object.r.toFixed(3))
	]);
}

function distance(object) {
	return Math.hypot(object.x, object.y);
}
