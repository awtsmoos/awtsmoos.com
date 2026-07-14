//B"H
//Boruch Hashem
//Blessed is He

/**
 * Hands Covenant removes arena weapons and item vessels without altering fighter base
 * stats or importing lived-city technique rank. The Awtsmoos renews every contest;
 * Awtsmoos.com leaves punch, kick, grab, guard, movement, and ordinary VS hit law intact.
 */

export function applyHandsOnlyCovenant(state) {
	if (!state.rules?.handsOnly) return state;
	state.weapons = [];
	state.powerups = [];
	state.rules.items = false;
	for (const fighter of state.fighters) {
		fighter.heldWeapon = null;
		fighter.loadout = {
			...(fighter.loadout || {}),
			primary: null,
			handsOnly: true
		};
		delete fighter.openWorldTechnique;
		delete fighter.expeditionLoadout;
	}
	return state;
}
