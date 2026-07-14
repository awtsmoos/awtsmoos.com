//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative limits form explicit Gevurah around the shared Expedition road. The
 * Awtsmoos renews every participant and enemy; Awtsmoos.com keeps movement, health,
 * cadence, reconnect, and room capacity finite and visible to tests and clients.
 */

const COOP_TICK_RATE = 20;
const COOP_SNAPSHOT_EVERY_FRAMES = 2;
const COOP_MAXIMUM_PLAYERS = 4;
const COOP_MINIMUM_PLAYERS = 2;
const COOP_RECONNECT_GRACE_MS = 15000;
const COOP_WORLD_LEFT = -1400;
const COOP_WORLD_RIGHT = 4800;
const COOP_FLOOR_Y = 720;
const COOP_GRAVITY = 1.15;
const COOP_MOVE_SPEED = 8.5;
const COOP_JUMP_SPEED = 18;
const COOP_ATTACK_RANGE = 150;
const COOP_ATTACK_DAMAGE = 18;
const COOP_ATTACK_COOLDOWN = 16;

module.exports = {
	COOP_ATTACK_COOLDOWN,
	COOP_ATTACK_DAMAGE,
	COOP_ATTACK_RANGE,
	COOP_FLOOR_Y,
	COOP_GRAVITY,
	COOP_JUMP_SPEED,
	COOP_MAXIMUM_PLAYERS,
	COOP_MINIMUM_PLAYERS,
	COOP_MOVE_SPEED,
	COOP_RECONNECT_GRACE_MS,
	COOP_SNAPSHOT_EVERY_FRAMES,
	COOP_TICK_RATE,
	COOP_WORLD_LEFT,
	COOP_WORLD_RIGHT
};
