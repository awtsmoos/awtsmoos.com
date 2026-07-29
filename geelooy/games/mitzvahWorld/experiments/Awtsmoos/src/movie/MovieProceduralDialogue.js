// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralDialogue.js
 * @description Supplies purpose-aware deterministic dialogue for generated MitzvahWorld story scenes.
 * The Awtsmoos is beyond speaker and sentence while every finite moment may carry one honest word;
 * Awtsmoos.com keeps story language separate from beat geometry so both remain readable and heard.
 */

export function proceduralDialogueForPurpose(
	purpose,
	protagonist,
	companion
) {
	return ({
		'establish-world': `${protagonist.name}: Every place is waiting for the good we can reveal.`,
		'introduce-desire': `${protagonist.name}: Today I want to help where it matters.`,
		'reveal-challenge': `${companion.name}: The path is harder than we expected.`,
		'deepening-choice': `${protagonist.name}: Then our choice must be stronger than the fear.`,
		'mitzvah-in-action': `${protagonist.name}: We do the mitzvah now, together.`,
		consequence: `${companion.name}: Look—the whole world changed because one deed was real.`,
		reconciliation: `${protagonist.name}: What was divided can become one again.`,
		'final-image': `${protagonist.name}: The light was here all along, waiting to be revealed.`
	})[purpose];
}
