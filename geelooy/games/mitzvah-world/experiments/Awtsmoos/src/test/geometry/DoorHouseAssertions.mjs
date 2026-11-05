// B"H
import assert from 'node:assert/strict';
import { allHouseDoorDefs } from '../../world/House3D.js';
import { matrixBasis } from '../../world/DoorWorldMatrix.js';
import {
	colliderDefinition,
	doorPose
} from '../../world/DoorRuntimePose.js';
import { flatSampler } from './GeometryFixtures.mjs';
import { assertRoofGeometry } from './RoofGeometryAssertions.mjs';

export function assertDoorAndHouseGeometry(fixtures) {
	const doors = allHouseDoorDefs({}, flatSampler);
	assert.ok(doors.length >= fixtures.specs.length, 'every house has an entry door');
	for (const door of doors) {
		assertDoorFrame(door);
	}
	assertHouseShells(fixtures);
	assertMezuzahs(fixtures, doors);
	assertRoofGeometry(fixtures.roofs, fixtures.specs.length);
	assertYards(fixtures);
	return {
		doorCount: doors.length,
		mezuzaCount: fixtures.definitions.userData.mezuzahs.length,
		interiorMezuzahs: fixtures.definitions.userData.mezuzahs
			.filter((item) => item.doorwayKind === 'interior').length,
		closedMatrixChecks: doors.length,
		wallPlaneSweepChecks: doors.length,
		roofSolids: fixtures.roofs.length,
		yardGrassFields: fixtures.yardGrass.length
	};
}

function assertDoorFrame(door) {
	const closed = doorPose(door, 0);
	const open = doorPose(door, 1);
	const collider = colliderDefinition(door, 0);
	const basis = matrixBasis(closed.matrix);
	assert.equal(closed.angle, 0, `${door.id} closed angle is not exact zero`);
	assert.equal(door.frame.hinge.side, 'entry-right', `${door.id} hinge is not on entering-right`);
	assert.deepEqual(closed.matrix, [...door.frame.closedWorldMatrix]);
	assert.deepEqual(collider.userData.AwtsmoosDoorPose.worldMatrix, closed.matrix);
	assert.ok(dot(basis.tangent, door.frame.basis.right) > 0.9999999);
	assert.ok(dot(basis.normal, door.frame.basis.outward) > 0.9999999);
	const displacement = {
		x: open.center.x - closed.center.x,
		y: 0,
		z: open.center.z - closed.center.z
	};
	assert.ok(dot(displacement, door.frame.basis.inward) > 0, `${door.id} opens outward from wall plane`);
	assert.ok(door.frame.swing.minimumSweptInwardClearance > 0);
}

function assertHouseShells(fixtures) {
	for (const house of fixtures.definitions.userData.houses) {
		assert.ok(house.wallHeight >= house.floors * house.storyHeight);
		assert.equal(house.partitionFullHeight, true);
	}
	for (const partition of fixtures.definitions.userData.rooms) {
		assert.equal(partition.actualWidth, partition.fullSpan);
		assert.equal(partition.touchesLeftBoundary, true);
		assert.equal(partition.touchesRightBoundary, true);
		assert.equal(partition.touchesCeiling, true);
		assert.ok(partition.mezuzaId, `${partition.id} has no mezuzah`);
	}
}

function assertMezuzahs(fixtures, doors) {
	const items = fixtures.definitions.userData.mezuzahs;
	assert.equal(items.length, doors.length, 'every doorway must have one mezuzah');
	for (const item of items) {
		const door = doors.find((candidate) => candidate.id === item.doorId);
		assert.ok(door, `missing door for ${item.id}`);
		assert.ok(item.dotFromOpeningCenter > 0, `${item.id} is not entering-right`);
		assert.ok(item.sourceFaceDot > 0, `${item.id} is not on the outside/source side`);
		assert.ok(item.upperThirdRatio >= 2 / 3, `${item.id} is not in the upper third`);
		assert.ok(item.cavityDepthDot < 0, `${item.id} is not in the exterior reveal cavity`);
		assert.ok(item.slantRadians > 0, `${item.id} slants in the old direction`);
		assert.equal(item.entrySide, 'right');
		assert.equal(item.hingeIsEntryRight, true);
		assert.equal(item.jambFace, 'entry-right-exterior-reveal-cavity');
		assert.equal(item.placement, 'outside-right-doorpost-upper-third-reveal-cavity');
		assert.equal(item.facing, 'visible-from-source-outside-entering-room');
		if (item.doorwayKind === 'interior') {
			assert.match(item.sourceRoomId, /original-room$/);
		}
	}
}

function assertYards(fixtures) {
	assert.equal(fixtures.yardGrass.length, fixtures.specs.length);
	for (const grass of fixtures.yardGrass) {
		const evidence = grass.userData.AwtsmoosYardGrass;
		assert.equal(grass.solid, false);
		assert.equal(evidence.reactsToPlayer, true);
		assert.equal(evidence.insideFenceOnly, true);
		assert.ok(evidence.bladeCount > 0);
		assert.ok(evidence.tuftCount >= 150);
	}
}

function dot(left, right) {
	return left.x * right.x + left.y * right.y + left.z * right.z;
}
