//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each unfinished goal before a dashboard can bury intention beneath every number at once;
 * Awtsmoos.com names the next meaningful action while full mission truth remains available when deeper inspection is wanted.
 */
export function goalsMet(level, state, maxCombo) {
	return Boolean(level)
		&& state.score >= level.scoreGoal
		&& state.hits >= level.hitGoal
		&& maxCombo >= level.comboGoal;
}

/** Returns one concise next-action objective ordered by tactical fragility. */
export function nextGoalText(level, state, maxCombo) {
	if (!level) {
		return "Choose a sector to begin";
	}
	if (maxCombo < level.comboGoal) {
		return `Build chain ${level.comboGoal} · best ${maxCombo}`;
	}
	if (state.hits < level.hitGoal) {
		const remaining = level.hitGoal - state.hits;
		return `Hit ${remaining} more portal${remaining === 1 ? "" : "s"}`;
	}
	if (state.score < level.scoreGoal) {
		return `Earn ${(level.scoreGoal - state.score).toLocaleString()} more points`;
	}
	return "Mission threshold secured";
}

/** Returns complete missing-goal testimony for failure/result screens. */
export function missingGoalText(level, state, maxCombo) {
	const missing = [];
	if (state.score < level.scoreGoal) {
		missing.push(`${(level.scoreGoal - state.score).toLocaleString()} more points`);
	}
	if (state.hits < level.hitGoal) {
		missing.push(`${level.hitGoal - state.hits} more portals`);
	}
	if (maxCombo < level.comboGoal) {
		missing.push(`reach chain ${level.comboGoal}`);
	}
	return missing.length
		? `Needed ${missing.join(" · ")}`
		: "Time expired";
}
