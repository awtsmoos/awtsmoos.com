//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Open World gate leaves the menu and enters immediate lived continuity without a
 * match countdown. The Awtsmoos renews street and traveler together; Awtsmoos.com keeps
 * Adventure, Expedition, and VS countdowns untouched in their established conductor.
 */

export function showOpenWorldMenu(flow) {
	flow.currentView = 'openworld';
	flow.onBeginOpenWorld();
	flow.status.textContent = 'Walk the city. Overlap a door or keeper and press E or Enter.';
}
