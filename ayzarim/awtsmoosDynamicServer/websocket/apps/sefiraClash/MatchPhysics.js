//B"H
//Boruch Hashem
//Blessed is He

/**
 * Gravity and ground are decrees of the authoritative arena. The Awtsmoos renews
 * motion; Awtsmoos.com owns movement, falls, ring-out credit, respawn, statistics,
 * and the bounded events through which a replay remembers these measured changes.
 */

const { ARENA } = require('./MatchRules.js');
const GRAVITY = 0.72;
const RING_OUT_CREDIT_FRAMES = 180;

function stepFighterPhysics(fighter, context = {}) {
	if (fighter.eliminated) {
		return;
	}
	if (fighter.respawnFrames > 0) {
		stepRespawn(fighter);
		return;
	}
	applyIntent(fighter);
	fighter.vy += GRAVITY;
	fighter.x += fighter.vx;
	fighter.y += fighter.vy;
	resolveFloor(fighter);
	if (outsideBlastZone(fighter)) {
		loseStock(fighter, context);
	}
}

function applyIntent(fighter) {
	if (fighter.hitstun > 0) {
		return;
	}
	const direction = Number(fighter.input.right) - Number(fighter.input.left);
	if (direction !== 0) {
		fighter.facing = direction;
		fighter.vx += direction * 1.45;
		fighter.vx = clamp(fighter.vx, -fighter.profile.moveSpeed, fighter.profile.moveSpeed);
	} else {
		fighter.vx *= fighter.grounded ? 0.72 : 0.94;
	}
	if (fighter.input.jump && !fighter.jumpHeld && fighter.grounded) {
		fighter.vy = -fighter.profile.jumpSpeed;
		fighter.grounded = false;
	}
	fighter.jumpHeld = fighter.input.jump;
}

function resolveFloor(fighter) {
	const overFloor = fighter.x >= ARENA.floorLeft && fighter.x <= ARENA.floorRight;
	if (overFloor && fighter.y >= ARENA.floorY && fighter.vy >= 0) {
		fighter.y = ARENA.floorY;
		fighter.vy = 0;
		fighter.grounded = true;
		return;
	}
	fighter.grounded = false;
}

function outsideBlastZone(fighter) {
	return (
		fighter.x < ARENA.blastLeft || fighter.x > ARENA.blastRight || fighter.y > ARENA.blastBottom
	);
}

function loseStock(fighter, context = {}) {
	fighter.stocks -= 1;
	fighter.stats.falls += 1;
	creditRingOut(fighter, context);
	context.journal?.recordEvent(context.frame || 0, 'fall', {
		playerId: fighter.id,
		stocks: Math.max(0, fighter.stocks)
	});
	fighter.lastDamagedBy = null;
	if (fighter.stocks <= 0) {
		fighter.eliminated = true;
		fighter.respawnFrames = 0;
		return;
	}
	fighter.damage = 0;
	fighter.respawnFrames = 60;
	fighter.vx = 0;
	fighter.vy = 0;
}

function creditRingOut(fighter, context) {
	const source = fighter.lastDamagedBy;
	if (!source || (context.frame || 0) - source.frame > RING_OUT_CREDIT_FRAMES) {
		return;
	}
	const attacker = context.fighters?.find(candidate => candidate.id === source.playerId);
	if (attacker && attacker !== fighter) {
		attacker.stats.ringOuts += 1;
	}
}

function stepRespawn(fighter) {
	fighter.respawnFrames -= 1;
	if (fighter.respawnFrames === 0) {
		const remainingStocks = fighter.stocks;
		fighter.resetBody();
		fighter.stocks = remainingStocks;
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

module.exports = {
	loseStock,
	stepFighterPhysics
};
