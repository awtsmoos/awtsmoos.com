//B"H
//Boruch Hashem
//Blessed is He

/**
 * An attack becomes real only inside a server-measured window. The Awtsmoos
 * renews impact; Awtsmoos.com owns damage, guard, hitstun, knockback, statistics,
 * attacker memory, and the bounded event written into the public replay journal.
 */

/** Opens attacks from input edges and resolves every legal target once. */
function stepCombat(fighters, context = {}) {
	for (const fighter of fighters) {
		prepareAttack(fighter);
	}
	for (const attacker of fighters) {
		resolveAttack(attacker, fighters, context);
	}
	for (const fighter of fighters) {
		finishCombatFrame(fighter);
	}
}

function prepareAttack(fighter) {
	const canAct = !fighter.eliminated && fighter.respawnFrames === 0 && fighter.hitstun === 0;
	fighter.guarding = canAct && fighter.input.guard && fighter.attackFrames === 0;
	if (canAct && fighter.input.attack && !fighter.attackHeld && fighter.attackCooldown === 0) {
		fighter.attackFrames = 10;
		fighter.attackCooldown = fighter.profile.attackCooldown;
		fighter.attackTargets.clear();
	}
	fighter.attackHeld = fighter.input.attack;
}

function resolveAttack(attacker, fighters, context) {
	if (attacker.attackFrames < 4 || attacker.attackFrames > 7) {
		return;
	}
	for (const target of fighters) {
		if (canHit(attacker, target)) {
			applyHit(attacker, target, context);
			attacker.attackTargets.add(target.id);
		}
	}
}

function canHit(attacker, target) {
	if (attacker === target || target.eliminated || target.respawnFrames > 0) {
		return false;
	}
	if (attacker.attackTargets.has(target.id)) {
		return false;
	}
	const horizontal = target.x - attacker.x;
	const inFront = horizontal * attacker.facing >= -18;
	return (
		inFront &&
		Math.abs(horizontal) <= attacker.profile.attackReach &&
		Math.abs(target.y - attacker.y) <= 82
	);
}

function applyHit(attacker, target, context) {
	const guarded = target.guarding && target.facing * (attacker.x - target.x) >= -18;
	const damageScale = guarded ? 0.22 : 1;
	const forceScale = guarded ? 0.34 : 1;
	const appliedDamage = attacker.profile.attackDamage * damageScale;
	target.damage += appliedDamage;
	const force =
		((attacker.profile.attackKnockback + target.damage * 0.075) * forceScale) /
		target.profile.weight;
	target.vx = attacker.facing * force;
	target.vy = -Math.max(3.5, force * 0.48);
	target.hitstun = guarded ? 4 : Math.min(32, Math.ceil(force * 1.25));
	target.grounded = false;
	target.lastDamagedBy = { frame: context.frame || 0, playerId: attacker.id };
	attacker.stats.recordDealtHit(appliedDamage, guarded);
	target.stats.recordReceivedHit(appliedDamage);
	context.journal?.recordEvent(context.frame || 0, 'hit', {
		attackerId: attacker.id,
		damage: rounded(appliedDamage),
		guarded,
		targetId: target.id
	});
}

function finishCombatFrame(fighter) {
	if (fighter.attackCooldown > 0) {
		fighter.attackCooldown -= 1;
	}
	if (fighter.attackFrames > 0) {
		fighter.attackFrames -= 1;
	}
	if (fighter.hitstun > 0) {
		fighter.hitstun -= 1;
	}
}

function rounded(value) {
	return Math.round(value * 100) / 100;
}

module.exports = {
	stepCombat
};
