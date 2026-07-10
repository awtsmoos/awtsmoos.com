// B"H
import { localToWorld } from './HouseSpec.js';

/** Creates one static measured cuboid in the house's local frame. */
export function createHouseBox({
	id,
	material,
	spec,
	localX = 0,
	y,
	localZ = 0,
	sizeX,
	sizeY,
	sizeZ,
	walkable = false,
	visible = true,
	userData = {}
}) {
	const point = localToWorld(spec, localX, localZ);
	return {
		id,
		shape: 'box',
		solid: true,
		walkable,
		visible,
		noEdge: true,
		...material,
		position: { x: point.x, y, z: point.z },
		size: { x: sizeX, y: sizeY, z: sizeZ },
		rotation: { y: spec.yaw },
		userData
	};
}
