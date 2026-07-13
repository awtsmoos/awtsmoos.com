//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the apply pickup effect vessel in this instant, revealing
 * its focused js powerups effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Applies immediate pickup effects while preserving campaign identity.
 * Sparks bless movement, Perutas reward exploration without overpowering combat,
 * and arena relics remain timed vessels beneath the one source, the Awtsmoos.
 */
export function applyPickupEffect(state, fighter, orb) {
	fighter.buffs ||= {};
	if (orb.id === 'adventureSpark') {
		collectSpark(fighter, orb);
		return;
	}
	if (orb.id === 'adventurePeruta') {
		heal(fighter, 2);
		return;
	}
	if (orb.id === 'chesedHeal') {
		heal(fighter, 35);
		return;
	}
	if (orb.id === 'shofarBlast') {
		fireShofar(state, fighter, orb);
		return;
	}

	fighter.buffs[orb.id] = Math.max(fighter.buffs[orb.id] || 0, orb.duration || 480);
	if (orb.id === 'shieldCrystal') {
		fighter.buffs.ohrShield = Math.max(fighter.buffs.ohrShield || 0, 220);
	}
	if (orb.id === 'wingRelic') {
		fighter.airJumps = Math.max(fighter.airJumps || 0, 1);
	}
}

function collectSpark(fighter, orb) {
	heal(fighter, orb.hiddenSpark ? 10 : 6);
	fighter.buffs.netzachBoots = Math.max(
		fighter.buffs.netzachBoots || 0,
		orb.hiddenSpark ? 180 : 90
	);
}

function heal(fighter, amount) {
	fighter.damage = Math.max(0, (fighter.damage || 0) - amount);
}

function fireShofar(state, fighter, orb) {
	state.events.push({
		type: 'hit',
		attackerId: fighter.id,
		targetId: fighter.id,
		human: Boolean(fighter.human),
		x: fighter.x,
		y: fighter.y - 90,
		color: orb.color,
		letter: 'ש',
		damage: 0,
		force: 36,
		side: fighter.face || 1,
		fullCharge: true
	});
	fighter.buffs.shofarEcho = 180;
}
