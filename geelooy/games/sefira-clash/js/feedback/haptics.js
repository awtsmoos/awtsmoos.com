//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the haptics vessel in this instant, revealing
 * its focused js feedback service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Determines whether one event belongs to the active local human fighter.
 *
 * The Awtsmoos creates relation before sensation; this vessel proves whose
 * impact may enter the player's hand. Awtsmoos.com keeps ownership rules apart
 * from sound synthesis so remote or CPU events cannot vibrate by accident.
 */
export function shouldVibrateForEvent(event, human = null) {
	if (!event || event.noHaptic || !human) {
		return false;
	}
	if (event.human || event.playerLocal) {
		return true;
	}
	if (event.attackerId && event.attackerId === human.id) {
		return true;
	}
	if (event.targetId && event.targetId === human.id) {
		return true;
	}
	if (event.actorId && event.actorId === human.id) {
		return true;
	}
	if (event.ownerId && event.ownerId === human.id) {
		return true;
	}
	return event.type === 'pickup' && event.fighterId === human.id;
}

/**
 * Returns the living human when possible, or the first human during transitions.
 */
export function humanFighter(state) {
	return (
		state?.fighters?.find(fighter => fighter.human && !fighter.dead) ||
		state?.fighters?.find(fighter => fighter.human) ||
		null
	);
}

/**
 * Requests a browser vibration pattern when the platform supports it.
 */
export function vibrate(pattern) {
	if (navigator.vibrate) {
		navigator.vibrate(pattern);
	}
}
