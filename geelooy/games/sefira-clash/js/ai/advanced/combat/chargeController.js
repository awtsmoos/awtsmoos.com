//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the charge controller vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * AI charge controller.
 *
 * Chapter 13: the NPC learns patience with teeth. It may hold a kick like a
 * sealed thundercloud, but only while the enemy is still in the corridor of
 * consequence. If the target is close, idle, or near a ledge, the cloud breaks;
 * no more waiting for the human to move before the charged strike descends.
 *
 * @param {object} bot Acting NPC.
 * @param {object} world Sensed world packet.
 * @param {object} tactic Combat tactic.
 * @param {object} out Mutable input command.
 * @returns {void}
 */
export function applyChargePlan(bot, world, tactic, out) {
	bot.aiMind ||= {};
	bot.aiMind.chargePlan ||= blankPlan();
	const plan = bot.aiMind.chargePlan;
	if (!shouldCharge(world, tactic)) return resetPlan(plan);
	syncPlan(plan, tactic, world);
	const ready = plan.frames >= plan.releaseAt;
	const lost = !world.combat.canHitNow && plan.frames > 18;
	if (ready || lost || world.combat.reachableClose) return release(plan, out, tactic);
	hold(plan, out, tactic);
}

/**
 * Reveals the cancel charge behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 */
export function cancelCharge(bot) {
	if (bot.aiMind?.chargePlan) resetPlan(bot.aiMind.chargePlan);
}

function shouldCharge(world, tactic) {
	if (tactic.instant || tactic.button === 'none') return false;
	if (!world.combat.sameFightingLane) return false;
	return world.combat.canHitNow || world.edgePressure?.score > 0.32;
}

function syncPlan(plan, tactic, world) {
	const key = `${tactic.kind}:${tactic.button}:${world.target.id}`;
	if (plan.key !== key)
		Object.assign(plan, blankPlan(), {
			key,
			button: tactic.button,
			releaseAt: releaseFrames(tactic, world)
		});
	plan.frames++;
}

function releaseFrames(tactic, world) {
	if (world.combat.reachableClose) return 14;
	if (tactic.kind === 'EdgeChargeKick') return world.edgePressure.score > 0.72 ? 18 : 26;
	return 22;
}

function hold(plan, out, tactic) {
	aim(out, tactic);
	out[tactic.button] = true;
	out[`charge${capitalize(tactic.button)}`] = true;
}

function release(plan, out, tactic) {
	aim(out, tactic);
	out[tactic.button] = false;
	resetPlan(plan);
}

function aim(out, tactic) {
	out.aimX = tactic.aimX;
	out.aimY = tactic.aimY || 0;
	out.y = tactic.aimY || 0;
}

function blankPlan() {
	return { key: '', button: '', frames: 0, releaseAt: 22 };
}

function resetPlan(plan) {
	plan.key = '';
	plan.button = '';
	plan.frames = 0;
	plan.releaseAt = 22;
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
