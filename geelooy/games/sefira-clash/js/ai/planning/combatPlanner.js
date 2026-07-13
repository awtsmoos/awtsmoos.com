//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combat planner vessel in this instant, revealing
 * its focused js ai planning service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Combat planner with air-check humility.
 *
 * Chapter 217: aggression is sacred only when contact is possible. If the
 * enemy is above, below, or on another lane, the bot routes, jumps, drops, or
 * approaches before wasting frames punching invisible air.
 */
export function planCombat(sense) {
	const { combat, threat } = sense;
	if (threat.killDanger) return { kind: 'shield', score: 920 };
	if (combat.shouldChaseVertical)
		return { kind: combat.belowLane ? 'dropChase' : 'jumpChase', score: 880 };
	if (!combat.canHitNow) return { kind: 'approach', score: 610 };
	if (combat.shouldGrab) return { kind: 'grab', score: 900 };
	if (combat.shouldRapid) return { kind: 'rapid', score: 860 };
	if (combat.shouldAntiAir) return { kind: 'upAttack', score: 840 };
	if (combat.shouldSmash || (combat.killPercent && combat.reachableGround))
		return { kind: 'smash', score: 820 };
	if (combat.mid) return { kind: 'pressure', score: 700 };
	return { kind: 'approach', score: 520 };
}
