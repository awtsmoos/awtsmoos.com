// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowDoorTransform.test.mjs
 * @description Proves front and rotated interior doors remain centered in their local wall openings.
 * The Awtsmoos turns each finite door from its own appointed hinge; Awtsmoos.com keeps closed
 * centers, open radius, house yaw, and interior yaw aligned without applying world offsets twice.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	minimalMeadowDoorTransform
} from '../../app/MinimalMeadowDoorTransform.js';
import { housePoint } from '../../app/MinimalMeadowHouseMath.js';

const PROFILE = Object.freeze({
	doorWidth: 2.4,
	x: 12,
	yaw: Math.PI / 3,
	z: -4
});

function approximately(actual, expected, message) {
	assert.ok(Math.abs(actual - expected) < 1e-9, message);
}

function assertClosedCenter(specification) {
	const expected = housePoint(
		PROFILE,
		specification.localX,
		specification.localZ
	);
	const transform = minimalMeadowDoorTransform(PROFILE, specification, 0);
	approximately(transform.center.x, expected.x, 'closed x center');
	approximately(transform.center.z, expected.z, 'closed z center');
	approximately(
		Math.hypot(
			transform.center.x - transform.hinge.x,
			transform.center.z - transform.hinge.z
		),
		PROFILE.doorWidth / 2,
		'closed hinge radius'
	);
}

test('B"H front door center remains aligned after house rotation', () => {
	assertClosedCenter({
		localX: 1.5,
		localZ: 8,
		yaw: PROFILE.yaw
	});
});

test('B"H perpendicular interior door uses its own local yaw', () => {
	const specification = {
		localX: -3,
		localZ: 2,
		yaw: PROFILE.yaw + Math.PI / 2
	};
	assertClosedCenter(specification);
	const opened = minimalMeadowDoorTransform(PROFILE, specification, 1);
	approximately(
		Math.hypot(
			opened.center.x - opened.hinge.x,
			opened.center.z - opened.hinge.z
		),
		PROFILE.doorWidth / 2,
		'open hinge radius'
	);
	assert.notEqual(opened.angle, specification.yaw);
});
