// B"H
import assert from 'node:assert/strict';
import { allHouseDoorDefs } from '../../world/House3D.js';
import { normalizeAngle } from '../../world/HouseDoorGeometry.js';
import { flatSampler } from './GeometryFixtures.mjs';

export function assertDoorAndHouseGeometry(fixtures) {
	const doors = allHouseDoorDefs({}, flatSampler);
	assert.ok(doors.length >= fixtures.specs.length, 'every house has an entry door');
	for (const door of doors) {
		assert.ok(
			Math.abs(normalizeAngle(door.closedYaw - door.wallYaw)) < 1e-8,
			`${door.id} closed yaw differs from wall yaw`
		);
		assert.equal(door.frame.panel.closedYaw, door.frame.yaw);
		assert.deepEqual(door.hinge.worldPosition, door.frame.hinge.worldPosition);
	}
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
	for (const item of fixtures.definitions.userData.mezuzahs) {
		const door = doors.find((candidate) => candidate.id === item.doorId);
		assert.ok(door, `missing door for ${item.id}`);
		const dx = item.position.x - door.frame.center.x;
		const dz = item.position.z - door.frame.center.z;
		const localX = dx * door.frame.basis.right.x + dz * door.frame.basis.right.z;
		const inward = dx * door.frame.basis.inward.x + dz * door.frame.basis.inward.z;
		assert.ok(localX < 0, `${item.id} is not entering-right`);
		assert.ok(Math.abs(inward) <= door.frame.wall.thickness / 2 + 0.1);
		assert.equal(item.entrySide, 'right');
		assert.equal(item.placement, 'inside-reveal');
		assert.equal(item.facing, 'across-cavity');
	}
	return { doorCount: doors.length, mezuzaCount: fixtures.definitions.userData.mezuzahs.length };
}
