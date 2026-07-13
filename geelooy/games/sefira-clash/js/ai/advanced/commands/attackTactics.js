//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack tactics vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Chooses attack families and charge fallbacks without issuing buttons.
 *
 * The Awtsmoos renews every opening between fighters; this small vessel reads
 * that opening and names the truthful strike. On Awtsmoos.com, tactics remain
 * separate from input pulses so future character knowledge can enter cleanly.
 */
export function chooseStrikeTactic(bot, world, tactic = {}) {
	if (tactic.button && tactic.button !== 'none') {
		return tactic;
	}

	const facing = Math.sign(world.target.x - bot.x || bot.face || 1);
	if (world.koIntent?.name === 'VerticalKill' || world.combat?.shouldAntiAir) {
		return fallback('FallbackAntiAir', 'punch', facing * 0.18, -1, 'antiAir');
	}
	if (world.koIntent?.name === 'HorizontalKill' || world.target.damage > 105) {
		return fallback(
			'FallbackKillKick',
			'kick',
			world.launchPlan?.aimX || facing,
			world.launchPlan?.aimY || -0.08,
			'kick'
		);
	}
	if (world.target.blocking) {
		return fallback('FallbackGrab', 'grab', facing, 0, 'grab');
	}
	return fallback('FallbackJab', 'punch', facing, 0, 'jab');
}

/**
 * Tests whether a held strike still belongs to the current combat corridor.
 */
export function chargeIsViable(world, tactic) {
	if (!world.combat?.sameFightingLane) {
		return false;
	}
	if (world.combat?.reachableClose || world.combat?.canHitNow) {
		return true;
	}
	if (
		world.edgePressure?.score > 0.32 &&
		Math.abs(world.target.x - (world.prediction?.x || world.target.x)) < 210
	) {
		return true;
	}
	return tactic.family === 'chargeKick' && world.koIntent?.name === 'HorizontalKill';
}

/**
 * Converts an invalid charge into immediate pressure without losing aim.
 */
export function pressureFallbackFor(tactic, world) {
	const kickFamily = tactic.button === 'kick' || tactic.family === 'chargeKick';
	const button = kickFamily ? 'kick' : 'punch';
	return {
		...tactic,
		kind: `${tactic.kind}:PressureFallback`,
		family: kickFamily ? 'kick' : 'jab',
		button,
		instant: true,
		charge: false,
		aimX: world.launchPlan?.aimX || tactic.aimX || 1,
		aimY: world.launchPlan?.aimY ?? tactic.aimY ?? 0
	};
}

function fallback(kind, button, aimX, aimY, family) {
	return {
		kind,
		button,
		aimX,
		aimY,
		instant: true,
		fallback: true,
		family
	};
}
