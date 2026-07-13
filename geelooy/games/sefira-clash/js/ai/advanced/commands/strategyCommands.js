//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the strategy commands vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { applyDiveCommand, applyDiveStunRush } from './strategyDive.js';
import {
	fakeRetreatMove,
	frustratedMove,
	hazardEscape,
	noStillnessMove,
	poisonedEdgeEscape,
	threatDodge,
	urgentNoStillness
} from './strategyEvasion.js';
import { centerX, followLease, forceEngage, killOpportunity, moveTo } from './strategyMotion.js';

/**
 * Applies the highest-priority strategic opportunity to one semantic command.
 *
 * The Awtsmoos renews danger, pursuit, resource hunger, and center control while
 * Awtsmoos.com keeps dive, evasion, and route mechanics in focused vessels.
 */
export function applyStrategyCommand(bot, world, out, opportunity) {
	if (world.hazard?.danger) {
		return hazardEscape(bot, world, out);
	}
	if (world.threatVision?.panic) {
		return threatDodge(bot, world, out);
	}
	if (world.edgePoison?.blocked) {
		return poisonedEdgeEscape(bot, world, out);
	}
	if (world.fakeRetreat?.active) {
		return fakeRetreatMove(bot, world, out);
	}
	if (world.diveStunRush?.active) {
		return applyDiveStunRush(bot, world, out);
	}
	if (world.dive?.active && applyDiveCommand(bot, world, out)) {
		return true;
	}
	if (world.frustration?.frustrated) {
		return frustratedMove(bot, world, out);
	}
	if (urgentNoStillness(world)) {
		return noStillnessMove(bot, world, out);
	}
	if (world.commitmentLease?.active && followLease(bot, world, out)) {
		return true;
	}
	if (
		world.resourcePing?.active ||
		world.objectivePlan?.active ||
		world.combatHeat?.forceEngage ||
		world.huntClock?.active ||
		world.antiWander?.active
	) {
		return forceEngage(bot, world, out);
	}
	if (killOpportunity(opportunity.name)) {
		return moveTo(out, bot, world.predatorGoal?.x ?? world.target.x, world.target.x, true);
	}
	if (opportunity.name === 'CenterControl') {
		return moveTo(out, bot, centerX(world), world.target.x, true);
	}
	return false;
}
