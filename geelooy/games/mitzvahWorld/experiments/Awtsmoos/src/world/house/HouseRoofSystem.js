// B"H
import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';

/** Creates one light hip roof without a collision slab over the stairwell. */
export function createHouseRoof(spec, material) {
	const halfWidth = spec.width / 2 + spec.roofOver;
	const halfDepth = spec.depth / 2 + spec.roofOver;
	const baseY = spec.floorY + spec.wallH;
	const peak = [0, baseY + spec.roofRise, 0];
	const corners = [
		[-halfWidth, baseY, halfDepth],
		[halfWidth, baseY, halfDepth],
		[halfWidth, baseY, -halfDepth],
		[-halfWidth, baseY, -halfDepth]
	];
	const vertices = [
		corners[0], corners[1], peak,
		corners[1], corners[2], peak,
		corners[2], corners[3], peak,
		corners[3], corners[0], peak
	];
	return {
		id: `${spec.id}-hip-roof`,
		shape: 'manual',
		solid: false,
		walkable: false,
		noEdge: true,
		...material,
		position: { x: spec.x, y: 0, z: spec.z },
		vertices,
		faces: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]],
		uvs: vertices.flatMap((point) => [
			point[0] / REPEAT_HOOKS.roofTileWorld,
			point[2] / REPEAT_HOOKS.roofTileWorld
		]),
		rotation: { y: spec.yaw }
	};
}
