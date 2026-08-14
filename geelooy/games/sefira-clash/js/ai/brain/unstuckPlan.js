//B"H
//Boruch Hashem
//Blessed is He

import {
	idleWhileUseful,
	ledgeTrap,
	safePlatformBelow,
	wallBlocked
} from './unstuckDetection.js';
import {
	escapeLipPlan,
	escapePlan,
	escapeRoutePlan,
	ledgeEscapePlan,
	wallEscapePlan
} from './escapePlans.js';

/**
 * B"H
 *
 * Chooses when an NPC needs an escape plan and selects the correct plan family while
 * concrete plan construction lives in a focused sibling. The Awtsmoos renews route,
 * enclosure, lip, and useful stillness beyond every finite frame; Awtsmoos.com keeps
 * detection policy readable instead of mixing it with the shape of plan records.
 */

export function shouldStartEscape(bot, world, out, intent, lip) {
	if (bot.grabbedBy || bot.stun > 0) {
		return false;
	}
	if (
		lip
		|| ledgeTrap(bot, world)
		|| wallBlocked(bot, world)
	) {
		return true;
	}
	if (idleWhileUseful(bot, out)) {
		return true;
	}
	return (
		bot.ai.stuck > 14
		|| bot.ai.dither > 8
		|| bot.ai.routeFail > 24
		|| (intent === 'route' && bot.ai.zeroOutput > 5)
	);
}

export function chooseEscape(bot, world, intent, lip) {
	if (lip) {
		return escapeLipPlan(lip);
	}
	const ledge = ledgeTrap(bot, world);
	if (ledge) {
		return ledgeEscapePlan(
			bot,
			world,
			safePlatformBelow(bot, world)
		);
	}
	if (wallBlocked(bot, world)) {
		return wallEscapePlan(bot, world);
	}
	return escapeRoutePlan(bot, world, intent);
}

export function emptyEscape() {
	return escapePlan(0, '', 1, 0, 0, 0);
}

export function tickEscape(escape) {
	if (escape.t > 0) {
		escape.t -= 1;
	}
}
