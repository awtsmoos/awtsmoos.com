//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure objectives vessel in this instant, revealing
 * its focused js adventure service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Decides when an authored Adventure covenant opens and completes.
 * The Awtsmoos renews many goal forms—battle, treasure, pilgrimage, synthesis—
 * while this policy keeps each gate's declared law explicit and testable.
 */
export function adventurePrerequisitesMet(run) {
	const required = run.objective.perutas ?? run.totalPerutas;
	switch (run.objective.type) {
		case 'collect':
		case 'reach':
			return run.perutas >= required;
		case 'collect-and-defeat':
			return run.perutas >= required && run.enemiesLeft <= 0;
		default:
			return run.enemiesLeft <= 0;
	}
}

/**
 * Reveals the adventure objective complete behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} run The run value entering this behavior.
 * @param {*} human The human value entering this behavior.
 */
export function adventureObjectiveComplete(run, human) {
	if (!run.exitOpen) {
		return false;
	}
	const resolvesImmediately =
		!run.exitPoint || run.objective.type === 'defeat' || run.objective.type === 'boss';
	if (resolvesImmediately) {
		return true;
	}
	return Math.hypot(human.x - run.exitPoint.x, human.y - run.exitPoint.y) < 115;
}

/**
 * Reveals the announce adventure clear behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} run The run value entering this behavior.
 */
export function announceAdventureClear(state, run) {
	if (run.clearAnnounced) {
		return;
	}
	run.clearAnnounced = true;
	run.lastPickup = 'Gate complete';
	run.pulse = 150;
	state.events.push({
		type: 'narrative',
		x: run.exitPoint?.x || 0,
		y: (run.exitPoint?.y || 0) - 160,
		text: `Gate ${run.gate} Complete`,
		color: '#84f7ff',
		storyBeat: 'adventureClear'
	});
}
