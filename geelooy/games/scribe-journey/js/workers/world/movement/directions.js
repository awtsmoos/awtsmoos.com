// B"H

export const DIRECTION_VECTORS = Object.freeze({
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 }
});

const REVERSED_DIRECTIONS = Object.freeze({
	up: 'down',
	down: 'up',
	left: 'right',
	right: 'left'
});

export function directionForMap(mapId, direction) {
	if (mapId?.startsWith('babel_') || mapId === 'babel_ruins') {
		return REVERSED_DIRECTIONS[direction] || direction;
	}
	return direction;
}
