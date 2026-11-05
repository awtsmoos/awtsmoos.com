// B"H

export function obstacleBox(id, color, x, y, z, sizeX, sizeY, sizeZ, yaw = 0, rotation = {}, walkable = false) {
	return {
		id,
		shape: 'box',
		solid: true,
		walkable,
		color,
		position: { x, y, z },
		size: { x: sizeX, y: sizeY, z: sizeZ },
		yaw,
		rotation: { y: yaw, ...rotation }
	};
}

export function obstaclePlatform(...argumentsList) {
	return { ...obstacleBox(...argumentsList), walkable: true };
}

export function obstacleCeiling(...argumentsList) {
	return { ...obstacleBox(...argumentsList), walkable: false };
}

export function obstacleDiamond(id, color, x, y, z, size, yaw = 0) {
	return {
		id,
		shape: 'diamond',
		solid: true,
		walkable: false,
		color,
		position: { x, y, z },
		size: { x: size, y: size, z: size },
		yaw,
		rotation: { y: yaw }
	};
}

export function obstacleDoorway(id, color, x, y, z, sizeX, sizeY, sizeZ, yaw = 0, door = { x: 2.2, y: 2.15 }) {
	return {
		id,
		shape: 'doorway',
		solid: true,
		walkable: false,
		color,
		position: { x, y, z },
		size: { x: sizeX, y: sizeY, z: sizeZ },
		door,
		yaw,
		rotation: { y: yaw }
	};
}

export function obstacleCylinder(id, color, x, y, z, radius, height, walkable) {
	return {
		id,
		shape: 'cylinder',
		solid: true,
		walkable,
		color,
		position: { x, y, z },
		radius,
		height,
		segments: 36,
		rotation: { y: 0 }
	};
}

export function obstacleSphere(id, color, x, y, z, radius) {
	return {
		id,
		shape: 'sphere',
		solid: true,
		walkable: false,
		color,
		position: { x, y, z },
		radius,
		rotation: { y: 0 }
	};
}
