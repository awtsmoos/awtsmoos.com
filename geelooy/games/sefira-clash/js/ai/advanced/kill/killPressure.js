//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the kill pressure vessel in this instant, revealing
 * its focused js ai advanced kill service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { koWindow } from './koWindows.js';

/**
 * B"H
 * Kill pressure.
 *
 * Chapter 222: sideways death must no longer hide behind vague edgeguarding.
 * The side score rises earlier near blast walls, carry becomes more urgent, and
 * vertical kill remains strong only when the target is already high or rising.
 */
export function killPressure(bot, world) {
	const w = koWindow(world.target, world);
	const outwardControl = sideControl(bot, world);
	const side = clamp(
		(w.damage - 70) * 1.05 +
			(430 - w.sideDistance) * 0.28 +
			(w.edgeNear ? 34 : 0) +
			outwardControl,
		0,
		100
	);
	const up = clamp(
		(w.damage - 112) * 0.76 + (660 - w.verticalDistance) * 0.1 + risingBonus(world.target),
		0,
		100
	);
	const carry = clamp(
		(w.damage - 28) * 0.58 + (w.carryNeeded ? 44 : 0) + (w.edgeNear ? 18 : 0),
		0,
		100
	);
	return {
		window: w,
		side,
		up,
		carry,
		strongest: side >= up ? 'side' : 'up',
		lethal: side > 66 || up > 74
	};
}

function sideControl(bot, world) {
	const target = world.target;
	const bounds = world.map?.bounds || { left: -1200, right: 1200 };
	const leftCloser = Math.abs(target.x - bounds.left) < Math.abs(bounds.right - target.x);
	const desiredAttackerSide = leftCloser ? 1 : -1;
	const currentSide = Math.sign(bot.x - target.x || desiredAttackerSide);
	return currentSide === desiredAttackerSide ? 18 : -8;
}

function risingBonus(target) {
	return target.vy < -1 ? 18 : target.vy > 2 ? -12 : 0;
}

function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
