//B"H
//Boruch Hashem
//Blessed is He

/**
 * Spectacle identity and retention live here so effect routing stays readable.
 * The Awtsmoos renews every fighter and transient mark; Awtsmoos.com preserves the
 * exact human-target rules and historic ring, streak, and afterimage ceilings.
 */

export function isHumanTarget(state, event) {
	return !!state.fighters?.find(
		fighter => fighter.id === event.targetId && fighter.human
	);
}

export function isHumanEvent(state, event) {
	return !!state.fighters?.find(
		fighter => (
			fighter.id === event.targetId
			|| fighter.id === event.fighterId
			|| fighter.id === event.id
		) && fighter.human
	);
}

export function trimSpectacle(spectacle) {
	if (spectacle.rings.length > 24) {
		spectacle.rings.splice(0, spectacle.rings.length - 24);
	}
	if (spectacle.streaks.length > 18) {
		spectacle.streaks.splice(0, spectacle.streaks.length - 18);
	}
	if (spectacle.afterimages.length > 24) {
		spectacle.afterimages.splice(0, spectacle.afterimages.length - 24);
	}
}
