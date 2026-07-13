//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the edge carry plan vessel in this instant, revealing
 * its focused js ai advanced edge service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { outward } from '../kill/launchDirection.js';

/**
 * B"H
 * Edge carry plan with restraint.
 *
 * Chapter 69: exile is no longer the answer to every breath. Edge carry wakes
 * only when percent, map, and position justify the journey.
 */
export function edgeCarryPlan(bot, world) {
	const dir = outward(bot, world);
	const standX = world.target.x - dir * 112;
	const distance = Math.abs(bot.x - standX);
	const pressure = world.koPressure || {};
	const percent = world.target.damage || 0;
	const zone = world.goal?.zone || world.mapZones?.zones?.[world.goal?.id || 0] || {};
	const hugeMapPenalty = (world.mapAnalysis?.width || 0) > 8000 ? 18 : 0;
	const centerPenalty = zone.kind === 'centerControl' && percent < 105 ? 28 : 0;
	const active =
		percent > 48 &&
		(!!pressure.window?.carryNeeded ||
			pressure.side > 40 ||
			pressure.carry > 48 ||
			zone.kind === 'edgeKill');
	const raw =
		80 -
		distance * 0.07 +
		(pressure.carry || 0) * 0.55 +
		(pressure.side || 0) * 0.18 +
		percent * 0.12;
	return {
		active,
		dir,
		standX,
		distance,
		score: Math.max(0, raw - hugeMapPenalty - centerPenalty)
	};
}
