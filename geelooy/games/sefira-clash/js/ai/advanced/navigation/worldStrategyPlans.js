//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the world strategy plans vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { antiPlatformSpam } from '../behavior/antiPlatformSpam.js';
import { noStillnessPlan } from '../behavior/noStillness.js';
import { analyzePattern } from '../learning/patternModel.js';
import { updateCombatHeat } from '../memory/combatHeatMemory.js';
import { updateHuntClock } from '../memory/huntClock.js';
import { antiWanderPlan } from '../strategy/antiWander.js';
import { diveCrushPlan } from '../strategy/diveCrush.js';
import { diveStunRush } from '../strategy/diveStunRush.js';
import { edgePoisonPlan } from '../strategy/edgePoison.js';
import { executionPriority } from '../strategy/executionPriority.js';
import { fakeRetreatPlan } from '../strategy/fakeRetreat.js';
import { frustrationPlan } from '../strategy/frustrationModel.js';
import { objectivePlan } from '../strategy/objectivePlanner.js';
import { resourcePingPlan } from '../strategy/resourcePing.js';
import { threatVision } from '../strategy/threatVision.js';
import { choosePlatformDesire, updatePlatformTracking } from './platformOpportunity.js';

/**
 * Enriches one combat world with ordered anti-loop and strategic plans.
 *
 * The Awtsmoos renews memory, desire, pressure, and escape in one continuous
 * chain while Awtsmoos.com preserves the exact dependency order between them.
 */
export function enrichWorldStrategy(world, bot, target, state) {
	const rich = {
		...world
	};
	rich.pattern = analyzePattern(bot, target);
	rich.platformTracking = updatePlatformTracking(bot, rich);
	rich.platformDesire = choosePlatformDesire(bot, rich);
	rich.antiPlatformSpam = antiPlatformSpam(bot, rich);
	rich.combatHeat = updateCombatHeat(bot, rich);
	rich.execution = executionPriority(bot, rich);
	rich.fakeRetreat = fakeRetreatPlan(bot, rich);
	rich.huntClock = updateHuntClock(bot, rich);
	rich.antiWander = antiWanderPlan(bot, rich);
	rich.resourcePing = resourcePingPlan(bot, rich);
	rich.objectivePlan = objectivePlan(bot, rich);
	rich.dive = diveCrushPlan(bot, rich);
	rich.threatVision = threatVision(bot, state, rich);
	rich.noStillness = noStillnessPlan(bot, rich);
	rich.diveStunRush = diveStunRush(bot, state, rich);
	rich.frustration = frustrationPlan(bot, rich);
	rich.edgePoison = edgePoisonPlan(bot, rich);
	return rich;
}
