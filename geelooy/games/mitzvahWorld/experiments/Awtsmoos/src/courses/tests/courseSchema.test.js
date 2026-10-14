// B"H
// Tests the frozen schema validator and that all three built-in courses pass.

import assert from 'node:assert/strict';
import test from 'node:test';
import { COURSE_DEFINITIONS } from '../courseDefinitions.js';
import { COURSE_SCHEMA_VERSION, validateCourse } from '../courseSchema.js';

test('schema version is frozen at v1', () => {
	assert.equal(COURSE_SCHEMA_VERSION, 'mitzvah-world.course/1');
});

test('all three built-in courses validate', () => {
	assert.equal(COURSE_DEFINITIONS.length, 3);
	for (const def of COURSE_DEFINITIONS) {
		const receipt = validateCourse(def);
		assert.equal(receipt.valid, true, `${def.id}: ${receipt.errors.join('; ')}`);
	}
});

test('course ids are exactly the three advertised', () => {
	const ids = COURSE_DEFINITIONS.map(def => def.id).sort();
	assert.deepEqual(ids, ['canopy-climb', 'meadow-dash', 'river-gap']);
});

test('validator rejects a bad schema tag', () => {
	const def = { ...COURSE_DEFINITIONS[0], schema: 'v2' };
	const receipt = validateCourse(def);
	assert.equal(receipt.valid, false);
	assert.ok(receipt.errors.some(e => e.includes('schema')));
});

test('validator rejects an unknown surface', () => {
	const def = JSON.parse(JSON.stringify(COURSE_DEFINITIONS[0]));
	def.platforms[0].surface = 'quicksand';
	const receipt = validateCourse(def);
	assert.equal(receipt.valid, false);
	assert.ok(receipt.errors.some(e => e.includes('surface')));
});

test('validator rejects duplicate mover ids and bad mover kinds', () => {
	const def = JSON.parse(JSON.stringify(COURSE_DEFINITIONS[1]));
	def.movers.push({ ...def.movers[0] });
	let receipt = validateCourse(def);
	assert.equal(receipt.valid, false);
	assert.ok(receipt.errors.some(e => e.includes('duplicates')));

	const def2 = JSON.parse(JSON.stringify(COURSE_DEFINITIONS[1]));
	def2.movers[0] = { ...def2.movers[0], kind: 'teleport' };
	receipt = validateCourse(def2);
	assert.equal(receipt.valid, false);
});

test('validator rejects non-positive par time and bad region', () => {
	const def = JSON.parse(JSON.stringify(COURSE_DEFINITIONS[0]));
	def.parSeconds = 0;
	assert.equal(validateCourse(def).valid, false);
	const def2 = JSON.parse(JSON.stringify(COURSE_DEFINITIONS[0]));
	def2.region = { minX: 5, maxX: 5, minZ: 0, maxZ: 10 };
	assert.equal(validateCourse(def2).valid, false);
});
