//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the recovery read vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Recovery-denial sensor.
 *
 * Chapter 74: exile must be real before the bot panics. Standing on a platform
 * edge is not death, and being slightly below a nearby platform is not a holy
 * emergency. This stricter read stops bots from bouncing forever.
 */
export function recoveryRead(target, floor) {
	const leftLedge = floor.x + 70;
	const rightLedge = floor.x + floor.w - 70;
	const farLeft = target.x < floor.x - 70;
	const farRight = target.x > floor.x + floor.w + 70;
	const deepBelow = target.y > floor.y + 190;
	const offstage = !target.grounded && (farLeft || farRight || deepBelow);
	const jumpsMax = 2 + (target.buffs?.doubleJump ? 1 : 0);
	const noJumps = (target.jumpsUsed || 0) >= jumpsMax && !target.grounded;
	const falling = target.vy > 4.5;
	const low = target.y > floor.y + 240;
	const side = target.x < floor.x + floor.w / 2 ? -1 : 1;
	const ledgeX = side < 0 ? leftLedge : rightLedge;
	return {
		offstage,
		noJumps,
		falling,
		low,
		vulnerable: offstage && (noJumps || falling || low),
		side,
		ledgeX,
		ledgeY: floor.y
	};
}
