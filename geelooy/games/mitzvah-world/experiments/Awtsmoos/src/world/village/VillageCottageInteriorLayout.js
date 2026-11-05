// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageInteriorLayout.js
 * @description Plans four rooms and four real partition doorways per cottage story.
 */

const DOOR_WIDTH = 1.44;
const WALL_THICKNESS = 0.18;

export function villageCottageInteriorLayout(options) {
	const doors = [];
	const rooms = [];
	const walls = [];
	for (let story = 0; story < options.stories; story += 1) {
		appendStory(options, story, walls, doors, rooms);
	}
	return Object.freeze({
		doors: Object.freeze(doors),
		rooms: Object.freeze(rooms),
		walls: Object.freeze(walls)
	});
}

function appendStory(options, story, walls, doors, rooms) {
	const floorY = options.base + story * options.storyHeight + 0.08;
	const wallHeight = options.storyHeight - 0.32;
	const wallCenterY = floorY + options.storyHeight * 0.48;
	const doorHeight = Math.min(2.25, options.storyHeight - 0.48);
	const xSpan = options.width - 1.1;
	const zSpan = options.depth - 1.1;
	appendPartition(options, story, 'x', xSpan, floorY, wallCenterY, wallHeight, doorHeight, walls, doors);
	appendPartition(options, story, 'z', zSpan, floorY, wallCenterY, wallHeight, doorHeight, walls, doors);
	appendRooms(options, story, floorY, rooms);
}

function appendPartition(options, story, axis, span, floorY, wallY, wallHeight, doorHeight, walls, doors) {
	const centers = [-span * 0.24, span * 0.24];
	const halfDoor = DOOR_WIDTH / 2;
	const boundaries = [-span / 2, centers[0] - halfDoor, centers[0] + halfDoor,
		centers[1] - halfDoor, centers[1] + halfDoor, span / 2];
	for (const [start, end] of [[boundaries[0], boundaries[1]], [boundaries[2], boundaries[3]], [boundaries[4], boundaries[5]]]) {
		walls.push(wallBox(options, axis, (start + end) / 2, wallY, end - start, wallHeight));
	}
	const wallTop = wallY + wallHeight / 2;
	for (let index = 0; index < centers.length; index += 1) {
		const center = centers[index];
		const lintelHeight = Math.max(0.2, wallTop - (floorY + doorHeight));
		walls.push(wallBox(options, axis, center, wallTop - lintelHeight / 2, DOOR_WIDTH, lintelHeight));
		doors.push(doorRecord(options, story, axis, index, center, floorY, doorHeight));
	}
}

function appendRooms(options, story, floorY, rooms) {
	const coordinates = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
	for (let index = 0; index < coordinates.length; index += 1) {
		const [sideX, sideZ] = coordinates[index];
		const sequence = story * 4 + index;
		const purpose = options.roomTypes?.[sequence]
			|| options.roomTypes?.[sequence % Math.max(1, options.roomTypes.length)]
			|| 'living-room';
		rooms.push(Object.freeze({
			center: worldPoint(options, sideX * options.width * 0.24, floorY, sideZ * options.depth * 0.24),
			houseId: options.id,
			id: `${options.id}-room-${sequence + 1}`,
			purpose,
			story
		}));
	}
}

function wallBox(options, axis, offset, y, span, height) {
	const localX = axis === 'x' ? offset : 0;
	const localZ = axis === 'z' ? offset : 0;
	return Object.freeze({
		position: worldPoint(options, localX, y, localZ),
		size: {
			x: axis === 'x' ? span : WALL_THICKNESS,
			y: height,
			z: axis === 'z' ? span : WALL_THICKNESS
		},
		yaw: options.yaw
	});
}

function doorRecord(options, story, axis, index, offset, bottomY, height) {
	const point = worldPoint(options, axis === 'x' ? offset : 0, bottomY, axis === 'z' ? offset : 0);
	return Object.freeze({
		bottomY,
		height,
		houseId: options.id,
		id: `${options.id}-interior-${story + 1}-${axis}-${index + 1}`,
		story,
		width: DOOR_WIDTH,
		x: point.x,
		yaw: options.yaw + (axis === 'z' ? Math.PI / 2 : 0),
		z: point.z
	});
}

function worldPoint(options, localX, y, localZ) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return {
		x: options.x + localX * cosine + localZ * sine,
		y,
		z: options.z - localX * sine + localZ * cosine
	};
}
