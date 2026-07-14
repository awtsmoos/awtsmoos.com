//B"H
//Boruch Hashem
//Blessed is He

/**
 * Physics gives shared intention one server-measured path through either the
 * default arena or an immutable published world. The Awtsmoos renews motion and
 * rest; Awtsmoos.com applies walls, floor, platforms, gravity, and impulses once.
 */

const { DEFAULT_ARENA } = require("./arena/ArenaGeometry.js");
const ARENA = DEFAULT_ARENA;
const FIGHTER = Object.freeze({
	height: 78,
	width: 46
});
const GRAVITY = 0.9;
const JUMP_VELOCITY = -17;
const MOVE_SPEED = 8;

function stepFighterPhysics(fighter, arena = ARENA) {
	if (fighter.eliminated) {
		return;
	}
	fighter.invulnerableFrames = Math.max(0, fighter.invulnerableFrames - 1);
	fighter.attackCooldown = Math.max(0, fighter.attackCooldown - 1);
	fighter.attackFrames = Math.max(0, fighter.attackFrames - 1);
	fighter.hazardCooldown = Math.max(0, fighter.hazardCooldown - 1);
	fighter.vx = fighter.input.axis * MOVE_SPEED;
	if (Math.abs(fighter.input.axis) > 0.05) {
		fighter.facing = Math.sign(fighter.input.axis);
	}
	if (fighter.consumeImpulse("jump") && isGrounded(fighter, arena)) {
		fighter.vy = JUMP_VELOCITY;
	}
	const previousBottom = fighter.y + FIGHTER.height;
	fighter.vy += GRAVITY;
	fighter.x += fighter.vx;
	fighter.y += fighter.vy;
	fighter.x = Math.max(
		0,
		Math.min(arena.width - FIGHTER.width, fighter.x)
	);
	landFighter(fighter, arena, previousBottom);
}

function isGrounded(fighter, arena) {
	const bottom = fighter.y + FIGHTER.height;
	if (Math.abs(bottom - arena.floorY) <= 1.5) {
		return true;
	}
	return arena.platforms.some((platform) =>
		horizontalOverlap(fighter, platform)
		&& Math.abs(bottom - platform.y) <= 1.5
	);
}

function landFighter(fighter, arena, previousBottom) {
	if (fighter.vy < 0) {
		return;
	}
	const surfaces = [
		{ width: arena.width, x: 0, y: arena.floorY },
		...arena.platforms
	].filter((surface) => horizontalOverlap(fighter, surface));
	const newBottom = fighter.y + FIGHTER.height;
	const landing = surfaces
		.filter((surface) => previousBottom <= surface.y && newBottom >= surface.y)
		.sort((left, right) => left.y - right.y)[0];
	if (landing) {
		fighter.y = landing.y - FIGHTER.height;
		fighter.vy = 0;
	}
}

function horizontalOverlap(fighter, rectangle) {
	return fighter.x < rectangle.x + rectangle.width
		&& fighter.x + FIGHTER.width > rectangle.x;
}

module.exports = {
	ARENA,
	FIGHTER,
	isGrounded,
	stepFighterPhysics
};
