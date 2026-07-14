//B"H
//Boruch Hashem
//Blessed is He

/**
 * Physics gives shared intention one server-measured path. The Awtsmoos renews
 * motion and rest; Awtsmoos.com applies gravity, floor, walls, and impulses in
 * one deterministic order no browser may rewrite.
 */

const ARENA = Object.freeze({
	floorY: 620,
	height: 720,
	width: 1280
});
const FIGHTER = Object.freeze({
	height: 78,
	width: 46
});
const GRAVITY = 0.9;
const JUMP_VELOCITY = -17;
const MOVE_SPEED = 8;

/** Advances one living fighter through a fixed server frame. */
function stepFighterPhysics(fighter) {
	if (fighter.eliminated) {
		return;
	}
	fighter.invulnerableFrames = Math.max(0, fighter.invulnerableFrames - 1);
	fighter.attackCooldown = Math.max(0, fighter.attackCooldown - 1);
	fighter.attackFrames = Math.max(0, fighter.attackFrames - 1);
	fighter.vx = fighter.input.axis * MOVE_SPEED;
	if (Math.abs(fighter.input.axis) > 0.05) {
		fighter.facing = Math.sign(fighter.input.axis);
	}
	const grounded = fighter.y + FIGHTER.height >= ARENA.floorY - 0.01;
	if (fighter.consumeImpulse("jump") && grounded) {
		fighter.vy = JUMP_VELOCITY;
	}
	fighter.vy += GRAVITY;
	fighter.x += fighter.vx;
	fighter.y += fighter.vy;
	fighter.x = Math.max(0, Math.min(ARENA.width - FIGHTER.width, fighter.x));
	if (fighter.y + FIGHTER.height >= ARENA.floorY) {
		fighter.y = ARENA.floorY - FIGHTER.height;
		fighter.vy = 0;
	}
}

module.exports = {
	ARENA,
	FIGHTER,
	stepFighterPhysics
};
