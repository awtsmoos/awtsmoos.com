// B"H

import { TILE_SIZE } from '../../../data/database.js';

const WALK_STEP_MS = 145;
const SPRINT_STEP_MS = 95;
const MAX_FRAME_MS = 50;

function movementDuration(state) {
	const requested = state.keys?.Shift ? SPRINT_STEP_MS : WALK_STEP_MS;
	const rawGateSpeed = state.gateEffects?.speedMult || 1;
	const earnedMultiplier = rawGateSpeed > 1.5 ? rawGateSpeed / 1.5 : 1;
	return Math.max(62, requested / earnedMultiplier);
}

export function beginStep(state, destination, direction) {
	const player = state.player;
	player.startX = player.x;
	player.startY = player.y;
	player.targetX = destination.targetX;
	player.targetY = destination.targetY;
	player.moveElapsed = 0;
	player.moveDuration = movementDuration(state);
	player.direction = direction;
	player.isMoving = true;
}

/**
 * Advances at most one current tile. A restored tab may bring a huge delta,
 * but the player still crosses reality one measured square at a time.
 */
export function advanceStep(state, deltaTime) {
	const player = state.player;
	const safeDelta = Math.min(Math.max(deltaTime || 0, 0), MAX_FRAME_MS);
	player.moveElapsed = Math.min(player.moveDuration, (player.moveElapsed || 0) + safeDelta);
	const progress = player.moveDuration > 0 ? player.moveElapsed / player.moveDuration : 1;

	player.pixelX = (player.startX + (player.targetX - player.startX) * progress) * TILE_SIZE;
	player.pixelY = (player.startY + (player.targetY - player.startY) * progress) * TILE_SIZE;

	if (progress < 1) return false;
	player.x = player.targetX;
	player.y = player.targetY;
	player.pixelX = player.x * TILE_SIZE;
	player.pixelY = player.y * TILE_SIZE;
	player.isMoving = false;
	return true;
}
