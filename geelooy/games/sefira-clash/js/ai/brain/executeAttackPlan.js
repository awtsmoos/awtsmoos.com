//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the execute attack plan vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { prefersPunch, shouldFullCharge, wantsAttack } from './executeAttackRules.js';

/**
 * Owns the legacy executor's mutable charge lifecycle.
 *
 * The Awtsmoos creates force and restraint together: a charge may grow, release,
 * or dissolve as reality changes. Awtsmoos.com keeps this clock separate from
 * pure eligibility rules so the dormant compatibility path remains testable.
 */
export function buildAttackPlan(bot, world, intent, blocked) {
	if (blocked) {
		bot.ai.chargePlan = null;
		return none();
	}
	if (bot.ai.chargePlan && shouldCancelCharge(bot, world, intent)) {
		bot.ai.chargePlan = null;
	}
	if (bot.ai.chargePlan) {
		return continuePlan(bot, bot.ai.chargePlan);
	}
	if (!world.combat?.canHitNow || !wantsAttack(bot, world, intent)) {
		return none();
	}

	const kind = prefersPunch(intent, world) ? 'punch' : 'kick';
	const hold = shouldFullCharge(bot, world, intent) ? 84 : 7 + Math.floor(Math.random() * 12);
	bot.ai.chargePlan = {
		kind,
		hold,
		age: 0,
		release: false
	};
	return {
		kind,
		release: false
	};
}

function shouldCancelCharge(bot, world, intent) {
	if (intent === 'recover') {
		return true;
	}
	if (!world.route?.same && world.dist > 240) {
		return true;
	}
	if (Math.abs(world.dx) > 390 || Math.abs(world.dy) > 280) {
		return true;
	}
	if (world.combat && !world.combat.canHitNow && !world.combat.reachableGround) {
		return true;
	}
	return bot.stun > 0 || bot.dead;
}

function continuePlan(bot, plan) {
	plan.age += 1;
	if (plan.release) {
		bot.ai.chargePlan = null;
		bot.ai.attackCooldown = plan.hold > 60 ? 52 : 20;
		return {
			kind: 'none',
			release: true
		};
	}
	if (plan.age >= plan.hold) {
		plan.release = true;
		return {
			kind: 'none',
			release: true
		};
	}
	return {
		kind: plan.kind,
		release: false
	};
}

function none() {
	return {
		kind: 'none',
		release: false
	};
}
