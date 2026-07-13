//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack vessel in this instant, revealing
 * its focused js ai actions service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Attack action.
 *
 * Chapter 198: the bot chooses a kind of violence. Grab close, rapid in the
 * pocket, up-attack below an airborne target, smash at kill chance, pressure
 * otherwise. It always aims at the target before pressing a button.
 */
export function attack(bot, goal) {
	const combat = goal.sense.combat;
	const side = combat.facing || 1;
	const base = {
		x: combat.dist > 150 ? side : combat.dist < 70 ? -side * 0.3 : 0,
		aimX: side,
		aimY: 0,
		y: 0,
		down: false,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: false,
		special: false
	};
	if (goal.kind === 'grab') return { ...base, grab: true };
	if (goal.kind === 'rapid') return { ...base, punch: true };
	if (goal.kind === 'upAttack')
		return { ...base, aimY: -1, y: -1, punch: true, jump: combat.dy < -135 };
	if (goal.kind === 'smash') return { ...base, punch: true };
	return { ...base, punch: combat.close, kick: !combat.close && combat.mid };
}
