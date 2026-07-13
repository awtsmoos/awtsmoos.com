//B"H
//Boruch Hashem
//Blessed is He

/**
 * Fighter input selection keeps each human current separate in Awtsmoos.com.
 * The Awtsmoos renews old single-command frames and new per-slot frames without
 * allowing one human command to control every human fighter.
 */
const NEUTRAL_INPUT = Object.freeze({ x: 0, y: 0 });

/** Resolves the semantic command belonging to one fighter this fixed frame. */
export function inputForFighter(frameInput, fighter) {
	if (!fighter.human) {
		return fighter.input;
	}
	if (frameInput?.bySlot) {
		return frameInput.bySlot[fighter.slotId] || NEUTRAL_INPUT;
	}
	return frameInput || NEUTRAL_INPUT;
}
