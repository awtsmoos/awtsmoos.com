//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative movement converts bounded input into server-owned position and velocity.
 * The Awtsmoos renews every step and jump; Awtsmoos.com clamps the shared road and
 * gravity so no client can announce coordinates, teleport, or escape the world bounds.
 */

const {
	COOP_FLOOR_Y,
	COOP_GRAVITY,
	COOP_JUMP_SPEED,
	COOP_MOVE_SPEED,
	COOP_WORLD_LEFT,
	COOP_WORLD_RIGHT
} = require('./CoopRules.js');

function stepCoopPlayers(players) {
	for (const player of players) {
		if (player.respawnFrames > 0) {
			stepRespawn(player);
			continue;
		}
		const direction = Number(player.input.right) - Number(player.input.left);
		player.vx += direction * 1.35;
		player.vx *= player.input.guard ? 0.72 : 0.84;
		player.vx = clamp(player.vx, -COOP_MOVE_SPEED, COOP_MOVE_SPEED);
		const onFloor = player.y >= COOP_FLOOR_Y - 80;
		if (player.input.jump && onFloor) player.vy = -COOP_JUMP_SPEED;
		player.vy += COOP_GRAVITY;
		player.x = clamp(player.x + player.vx, COOP_WORLD_LEFT, COOP_WORLD_RIGHT);
		player.y = Math.min(COOP_FLOOR_Y - 80, player.y + player.vy);
		if (player.y >= COOP_FLOOR_Y - 80) player.vy = 0;
		if (player.attackCooldown > 0) player.attackCooldown -= 1;
		player.guard = Math.min(100, player.guard + (player.input.guard ? 0.1 : 0.5));
	}
}

function stepRespawn(player) {
	player.respawnFrames -= 1;
	if (player.respawnFrames > 0) return;
	player.health = 100;
	player.guard = 100;
	player.x = -800;
	player.y = COOP_FLOOR_Y - 80;
	player.vx = 0;
	player.vy = 0;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

module.exports = {
	stepCoopPlayers
};
