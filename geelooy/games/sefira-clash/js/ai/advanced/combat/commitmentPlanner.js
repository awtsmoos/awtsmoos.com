//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the commitment planner vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Tactical commitment planner.
 *
 * Chapter 83: commitment now honors violence without losing law. Anti-peace
 * becomes ForceApproach, recent hits become ComboContinue, wounded enemies
 * become KillConfirm, but invalid attacks still dissolve into approach.
 */
export function chooseCommitment(bot, world, mode, attackCheck) {
	bot.aiMind ||= {};
	const current = bot.aiMind.commitment;
	const desired = desiredCommitment(bot, world, mode, attackCheck);
	if (current && current.name === desired.name && current.age < current.min) return age(current);
	if (
		current &&
		current.locked &&
		current.age < current.max &&
		compatible(current, desired, attackCheck)
	)
		return age(current);
	bot.aiMind.commitment = { ...desired, age: 0 };
	return bot.aiMind.commitment;
}

function desiredCommitment(bot, world, mode, attackCheck) {
	if (mode.startsWith('Recover')) return vow(mode, 10, 55, false);
	if (mode.startsWith('Escape')) return vow(mode, 12, 50, false);
	if (mode === 'PlatformAscend' || mode === 'PlatformDescend') return vow(mode, 18, 90, true);
	if (world.threat?.panic) return vow('RetreatHighPercent', 16, 60, true);
	if (world.antiPeace?.active && !attackCheck?.valid) return vow('ForceApproach', 12, 70, true);
	if (world.comboMomentum?.active)
		return vow(attackCheck?.valid ? 'ComboContinue' : 'ForceApproach', 10, 70, true);
	if (world.combatHeat?.killMode)
		return vow(attackCheck?.valid ? 'KillConfirm' : 'ForceApproach', 12, 80, true);
	if (world.threat?.charging)
		return vow(world.combat.reachableClose ? 'InterruptCharge' : 'FlankCharge', 14, 50, true);
	if (world.edgePressure?.score > 0.45 && world.edgePressure?.distance < 220)
		return vow('EdgeTrap', 18, 75, true);
	if (!attackCheck?.valid && mode === 'Attack') return vow('ApproachPocket', 10, 40, true);
	if (world.combatTactic?.kind === 'ComboRapid' || world.combatTactic?.kind === 'PunishClose')
		return vow('RapidPressure', 8, 30, true);
	if (world.combatTactic?.kind?.includes('Charge')) return vow('ChargeRelease', 14, 62, true);
	return vow(mode === 'Attack' ? 'HoldThreat' : 'ApproachPocket', 10, 46, true);
}

function compatible(current, desired, attackCheck) {
	if (
		!attackCheck?.valid &&
		['ChargeRelease', 'RapidPressure', 'KillConfirm'].includes(current.name)
	)
		return false;
	if (current.name === 'ForceApproach' && desired.name === 'EdgeTrap') return false;
	return current.name === desired.name || current.name === 'ApproachPocket';
}

function age(commitment) {
	commitment.age++;
	return commitment;
}

function vow(name, min, max, locked) {
	return { name, min, max, locked };
}
