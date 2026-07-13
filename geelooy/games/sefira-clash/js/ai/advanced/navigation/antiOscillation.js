//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the anti oscillation vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Anti-oscillation command memory.
 *
 * Chapter 16: a bot pacing left-right-left is a candle flickering in exile.
 * This gate counts meaningless reversals, then demands a short commitment so
 * motion becomes intention instead of nervous dust.
 */
export function calmOscillation(bot, world, out, mode) {
	if (shouldIgnore(mode, world, out)) return out;
	const sign = Math.sign(out.x || 0);
	bot.aiMind ||= {};
	const osc = (bot.aiMind.oscillation ||= { last: 0, flips: 0, lock: 0, locked: 0 });
	osc.lock = Math.max(0, osc.lock - 1);
	if (sign && osc.last && sign !== osc.last) osc.flips++;
	else osc.flips = Math.max(0, osc.flips - 0.35);
	if (sign) osc.last = sign;
	if (osc.flips >= 3 && !osc.lock) {
		osc.lock = 22;
		osc.locked = sign || osc.last || towardTarget(bot, world);
		osc.flips = 0;
	}
	if (osc.lock && sign && sign !== osc.locked)
		out.x = shouldHoldStill(bot, world) ? 0 : osc.locked;
	bot.aiMind.oscillation = osc;
	return out;
}

function shouldIgnore(mode, world, out) {
	if (mode === 'Attack' || mode === 'RecoverLow' || mode === 'RecoverHigh') return true;
	if (mode?.startsWith('Escape')) return true;
	return !!(out.punch || out.kick || out.grab || out.special || world.threatVision?.panic);
}

function shouldHoldStill(bot, world) {
	return Math.abs((world.target?.x || bot.x) - bot.x) < 120 && world.combat?.sameFightingLane;
}

function towardTarget(bot, world) {
	return Math.sign((world.target?.x || bot.x + bot.face) - bot.x) || bot.face || 1;
}
