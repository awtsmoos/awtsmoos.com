// B"H
import {
	obstacleBox,
	obstacleCeiling,
	obstacleCylinder,
	obstacleDiamond,
	obstacleDoorway,
	obstaclePlatform,
	obstacleSphere
} from './ObstaclePrimitives.js';
import { tallDoorwayWallDef } from './DoorwaySpecs.js';

/** Preserves the existing collision test course outside production houses. */
export function createObstacleTestCourse() {
	return [
		obstacleBox('long-rotated-wall', '#4b3b34', 0, 1, -6, 9, 2, 0.8, 0.42),
		obstacleBox('thin-angle-wall', '#6d5c55', -4.2, 0.8, 1.3, 0.8, 1.6, 4.8, -0.74),
		obstacleDiamond('diamond-stone', '#6b7484', -2.2, 0.95, -2.4, 1.9, 0.25),
		obstacleBox('small-climb-block', '#a77845', 2.2, 0.34, -1.8, 1.25, 0.42, 1.25, -0.35, {}, true),
		obstacleDoorway('literal-boolean-doorway-wall', '#5e4439', 0, 1.5, -13, 8.5, 3, 0.75, 0.08, { x: 2.35, y: 2.18 }),
		tallDoorwayWallDef(),
		...testStairs('climb-staircase-a', -3.6, 6.4, -0.5),
		...testStairs('climb-staircase-b', 6.6, 6.1, 0.72),
		obstaclePlatform('floating-step-one', '#8e764d', -6, 0.65, -9.2, 2.4, 0.42, 2.4, 0.35),
		obstaclePlatform('floating-step-two', '#9e885b', -8.8, 1.06, -11.4, 2.2, 0.42, 2.2, -0.52),
		obstaclePlatform('gentle-ramp-walk-test', '#7c6442', 4.8, 0.52, -8.6, 5, 0.34, 1.7, -0.7, { x: 0.25 }),
		obstaclePlatform('steep-burger-slide-hill', '#b8864f', -10.5, 0.86, 4.4, 5.4, 0.42, 3.3, 0.28, { x: 0.86 }),
		obstacleCeiling('hat-clearance-overhang', '#3d3630', 1.8, 2.8, 13.6, 4.8, 0.34, 3, 0.18),
		obstacleCeiling('low-bounce-ceiling', '#514740', 6.8, 2.1, 13.6, 4.5, 0.32, 2.6, -0.22, { x: 0.22 }),
		obstacleCylinder('round-procedural-dais', '#7060a8', 8.2, 0.42, -2.5, 1.7, 0.84, true),
		obstacleCylinder('tall-round-column-blocker', '#66594d', 10.8, 1.35, -4.9, 0.62, 2.7, false),
		obstacleSphere('floating-moon-orb', '#526f99', -7, 1.7, -4.5, 1.1),
		obstacleDiamond('silver-air-diamond', '#8491aa', -9.8, 1.8, -6.3, 1.6, 0.7),
		obstaclePlatform('zig-platform-a', '#82633f', 5.5, 0.52, 5.8, 2.3, 0.36, 1.8, 0.95),
		obstaclePlatform('zig-platform-b', '#7c5b43', 8.6, 0.98, 7.2, 2.2, 0.36, 1.8, -0.2)
	];
}

function testStairs(prefix, x, z, yaw) {
	return Array.from({ length: 7 }, (_, index) => {
		const distance = index * 0.82;
		const point = {
			x: x + Math.sin(yaw) * distance,
			z: z + Math.cos(yaw) * distance
		};
		return obstaclePlatform(
			`${prefix}-${index + 1}`,
			'#9b7849',
			point.x,
			0.13 + index * 0.18,
			point.z,
			1.55,
			0.26,
			0.9,
			yaw
		);
	});
}
