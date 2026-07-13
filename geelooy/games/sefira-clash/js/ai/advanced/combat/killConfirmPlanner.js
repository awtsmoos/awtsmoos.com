//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the kill confirm planner vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Kill confirm planner.
 *
 * Chapter 45: when the percent climbs, mercy changes shape. The bot chooses
 * launchers, traps, edges, and charged violence according to actual kill state.
 */
export function killConfirmTactic(bot, world, fallback) {
	if (!shouldKill(world)) return fallback;
	const c = world.combat;
	const edge = world.edgePressure;
	if (world.landingTrap?.active)
		return tactic('KillLandingTrap', 'kick', world.landingTrap.aimX, -0.15, true, 'kick');
	if (c.shouldAntiAir)
		return tactic(
			'KillAntiAir',
			'punch',
			Math.sign(world.target.x - bot.x || bot.face || 1),
			-1,
			true,
			'antiAir'
		);
	if (edge?.active && edge.score > 0.25)
		return tactic('EdgeFinishKick', 'kick', edge.attackToward, 0, false, 'chargeKick');
	if (c.reachableClose && world.target.damage > 120)
		return tactic('KillChargeKick', 'kick', c.facing, -0.05, false, 'chargeKick');
	if (c.reachableClose) return tactic('KillLauncher', 'kick', c.facing, -0.2, true, 'kick');
	if (c.canHitNow) return tactic('KillPoke', 'kick', c.facing, 0, true, 'kick');
	return fallback;
}
/**
 * Reveals the should kill behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} world The world value entering this behavior.
 */
export function shouldKill(world) {
	return !!(
		world.combatHeat?.killMode ||
		world.target.damage >= 86 ||
		world.koPressure?.lethal ||
		world.koIntent?.killReady
	);
}
function tactic(kind, button, aimX, aimY, instant, family) {
	return { kind, button, aimX: Math.sign(aimX || 1), aimY, instant, family };
}
