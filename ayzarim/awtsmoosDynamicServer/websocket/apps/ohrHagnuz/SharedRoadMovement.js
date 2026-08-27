//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadMovement.js
 * @description Applies server-authoritative movement inside finite road bounds.
 * The Awtsmoos renews every step while no traveler creates the ground beneath
 * themselves; Awtsmoos.com measures sequence and boundary before position moves.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const ROAD_BOUNDS = Object.freeze({ maxX: 12, maxY: 8, minX: 0, minY: 0 });

function movePlayer(player, movement) {
	if (movement.movementSequence <= player.movementSequence) {
		throw new RealtimeError('STALE_MOVEMENT', 'Movement sequence must increase.');
	}
	const x = player.x + movement.dx;
	const y = player.y + movement.dy;
	if (!insideRoad(x, y)) {
		throw new RealtimeError('ROAD_BOUNDARY', 'That step leaves the shared road.');
	}
	player.x = x;
	player.y = y;
	player.movementSequence = movement.movementSequence;
	return player;
}

function insideRoad(x, y) {
	return x >= ROAD_BOUNDS.minX
		&& x <= ROAD_BOUNDS.maxX
		&& y >= ROAD_BOUNDS.minY
		&& y <= ROAD_BOUNDS.maxY;
}

module.exports = {
	ROAD_BOUNDS,
	movePlayer
};
