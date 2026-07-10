// B"H
import assert from 'node:assert/strict';
import { allHouseDoorDefs } from '../../world/House3D.js';
import { matrixBasis } from '../../world/DoorWorldMatrix.js';
import {
	colliderDefinition,
	doorPose
} from '../../world/DoorRuntimePose.js';
import { flatSampler } from './GeometryFixtures.mjs';

export function assertDoorAndHouseGeometry(fixtures) {
	const doors = allHouseDoorDefs({}, flatSampler);
	assert.ok(doors.length >= fixtures.specs.length, 'every house has an entry door');
	for (const door of doors) {
		assertDoorFrame(door);
	}
	assertHouseShells(fixtures);
	assertMezuzahs(fixtures, doors);
	return {
		doorCount: doors.length,
		mezuzaCount: fixtures.definitions.userData.mezuzahs.length,
		closedMatrixChecks: doors.length,
		wallPlaneSweepChecks: doors.length,
		enteringRightChecks: fixtures.definitions.userData.mezuzahs.length
	};
}

function assertDoorFrame(door) {
	const closed = doorPose(door, 0);
	const open = doorPose(door, 1);
	const collider = colliderDefinition(door, 0);
	const basis = matrixBasis(closed.matrix);
	assert.equal(closed.angle, 0, `${door.id} closed angle is not exact zero`);
	assert.deepEqual(closed.matrix, [...door.frame.closedWorldMatrix]);
	assert.deepEqual(collider.userData.AwtsmoosDoorPose.worldMatrix, closed.matrix);
	assert.ok(dot(basis.tangent, door.frame.basis.right) > 0.9999999, `${door.id} tangent differs from wall`);
	assert.ok(dot(basis.normal, door.frame.basis.outward) > 0.9999999, `${door.id} normal differs from wall`);
	const displacement = {
		x: open.center.x - closed.center.x,
		y: 0,
		z: open.center.z - closed.center.z
	};
	assert.ok(dot(displacement, door.frame.basis.inward) > 0, `${door.id} opens away from the room`);
	assert.equal(door.frame.swing.sign, Math.sign(door.frame.hinge.localX));
	assert.ok(door.frame.swing.minimumSweptInwardClearance > 0, `${door.id} far edge crosses the wall plane`);
	assert.equal(door.frame.swing.clearanceScope, 'door-wall-plane');
	assert.equal(door.frame.swing.verifiedBy, 'sampled-far-edge-wall-plane-sweep');
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
	}
}

function assertMezuzahs(fixtures, doors) {
	for (const item of fixtures.definitions.userData.mezuzahs) {
		const door = doors.find((candidate) => candidate.id === item.doorId);
		assert.ok(door, `missing door for ${item.id}`);
		const delta = {
			x: item.position.x - door.frame.center.x,
			y: 0,
			z: item.position.z - door.frame.center.z
		};
		const localX = dot(delta, door.frame.basis.right);
		const inward = dot(delta, door.frame.basis.inward);
		assert.ok(localX > 0, `${item.id} is not entering-right`);
		assert.ok(item.dotFromOpeningCenter > 0, `${item.id} signed entering-right proof failed`);
		assert.ok(Math.abs(inward) <= door.frame.wall.thickness / 2 + 0.1);
		assert.equal(item.entrySide, 'right');
		assert.equal(item.placement, 'inside-reveal');
		assert.equal(item.facing, 'across-cavity');
	}
}

function dot(left, right) {
	return left.x * right.x + left.y * right.y + left.z * right.z;
}
