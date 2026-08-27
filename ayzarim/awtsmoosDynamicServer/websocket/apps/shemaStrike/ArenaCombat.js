//B"H
//Boruch Hashem
//Blessed is He

/**
 * Combat is judged where all fighters share one clock. The Awtsmoos renews
 * attacker and defender; Awtsmoos.com measures attack windows and overlap so no
 * distant browser may invent a hit, a stock, or a crown.
 */

const { FIGHTER } = require("./ArenaPhysics.js");
const ATTACK_COOLDOWN = 20;
const ATTACK_DURATION = 10;
const ATTACK_REACH = 86;
const DAMAGE = 24;

/** Begins accepted attacks, resolves active hitboxes, and handles stocks. */
function stepCombat(fighters) {
	for (const fighter of fighters) {
		beginAttack(fighter);
	}
	for (const attacker of fighters) {
		if (!isAttackActive(attacker)) {
			continue;
		}
		for (const defender of fighters) {
			resolveHit(attacker, defender);
		}
	}
}

function beginAttack(fighter) {
	if (fighter.eliminated || !fighter.consumeImpulse("attack") || fighter.attackCooldown > 0) {
		return;
	}
	fighter.attackFrames = ATTACK_DURATION;
	fighter.attackCooldown = ATTACK_COOLDOWN;
	fighter.hitTargets.clear();
}

function isAttackActive(fighter) {
	return !fighter.eliminated
		&& fighter.attackFrames >= 3
		&& fighter.attackFrames <= 8;
}

function resolveHit(attacker, defender) {
	if (attacker === defender || defender.eliminated || defender.invulnerableFrames > 0) {
		return;
	}
	if (attacker.hitTargets.has(defender.id) || !overlapsAttack(attacker, defender)) {
		return;
	}
	attacker.hitTargets.add(defender.id);
	defender.health = Math.max(0, defender.health - DAMAGE);
	defender.vx = attacker.facing * 12;
	defender.vy = -8;
	defender.invulnerableFrames = 12;
	if (defender.health > 0) {
		return;
	}
	attacker.score += 1;
	defender.stocks = Math.max(0, defender.stocks - 1);
	defender.respawn();
}

function overlapsAttack(attacker, defender) {
	const attackX = attacker.facing > 0
		? attacker.x + FIGHTER.width
		: attacker.x - ATTACK_REACH;
	return attackX < defender.x + FIGHTER.width
		&& attackX + ATTACK_REACH > defender.x
		&& attacker.y < defender.y + FIGHTER.height
		&& attacker.y + FIGHTER.height > defender.y;
}

module.exports = {
	ATTACK_DURATION,
	DAMAGE,
	stepCombat
};
