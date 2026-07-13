//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the recovery move vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Recovery burst.
 *
 * Chapter 185: offstage is not always death. Up plus special or punch in air
 * becomes a recovery burst, a short flash of mercy that grants vertical hope
 * without becoming infinite flight.
 */
export function applyRecoveryMove(f, input) {
	f.recoveryCooldown = Math.max(0, (f.recoveryCooldown || 0) - 1);
	if (f.grounded || f.recoveryCooldown > 0) return;
	const wants = (input.special || input.punch) && (input.y < -0.4 || input.aimY < -0.4);
	if (!wants) return;
	const power = f.hatStats?.recovery || 1;
	f.vy = Math.min(f.vy, -18 * power);
	f.vx += (input.x || f.face || 1) * 5 * power;
	f.recoveryCooldown = 95;
	f.events ||= [];
}
