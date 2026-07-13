//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the npc debug packet vessel in this instant, revealing
 * its focused js ai advanced debug service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H - AI debug packet for the visible mind. */
export function debugPacket(bot, world, progress, stuck, mode) {
	return {
		state: mode,
		intent: world.humanIntent?.name || 'none',
		koIntent: world.koIntent?.name || 'none',
		launch: world.launchPlan?.name || 'none',
		attackFamily: world.combatTactic?.family || 'none',
		predator: world.predatorGoal?.kind || 'none',
		opportunity: bot.aiMind.opportunity?.name || 'none',
		commitment: bot.aiMind.commitment?.name || 'none',
		pressureCommitment: bot.aiMind.pressureCommitment?.kind || 'none',
		reputation: world.attackReputation?.counter || 'neutral',
		platform: world.platformDesire?.reason || 'none',
		rivalry: bot.aiMind.rivalry?.id
			? `${bot.aiMind.rivalry.id}:${Math.round(bot.aiMind.rivalry.heat)}`
			: 'none',
		landingTrap: world.landingTrap?.active ? `${Math.round(world.landingTrap.x)}` : 'off',
		hunt: world.huntClock?.active ? Math.round(world.huntClock.value) : 0,
		hunger: Math.round(world.hunger?.value || 0),
		momentum: Math.round(world.momentum?.value || 0),
		threat: Math.round(
			Math.max(
				world.threatVision?.front || 0,
				world.threatVision?.behind || 0,
				world.threatVision?.hazard || 0
			)
		),
		execution: world.execution?.active ? 'kill' : 'off',
		jumpDebt: Math.round(world.jumpDebt?.value || 0),
		heat: Math.round(bot.aiMind.combatHeat?.heat || 0),
		antiPeace: bot.aiMind.antiPeace?.active ? `on:${bot.aiMind.antiPeace.frames}` : 'off',
		noStillness: bot.aiMind.noStillness?.mustMove ? bot.aiMind.noStillness.reason : 'clear',
		tactic: bot.aiMind.tactic || 'none',
		jumpReason: bot.aiMind.jumpReason || 'none',
		attackValid: bot.aiMind.attackCheck?.valid ?? false,
		attackReason: bot.aiMind.attackCheck?.reason || 'none',
		landing: world.landing?.active
			? `${Math.round(world.landing.x)},${Math.round(world.landing.y)}`
			: 'none',
		stuck: stuck.kind,
		routeFound: world.route.found,
		routeAction: world.step?.action || 'same',
		noProgress: progress.noProgress,
		target: world.target?.id
	};
}
