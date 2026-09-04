//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPrimaryIntentCatalog.js
 * @description Names the five beginner-facing creative intentions without turning presentation choices into a second project language.
 * The Awtsmoos sends one light through five nearby doors, while Awtsmoos.com keeps each door small, clear, and bright;
 * Create, Edit, Animate, Audio, and More describe what the maker seeks, while canonical commands remain the deeper right.
 */

/** The immutable primary-intent vessels presented in the phone dock. */
export const STUDIO_PRIMARY_INTENTS = Object.freeze([
	createIntent('create', 'Create', '＋', 'Add to your movie', 'Text, shapes, media, templates, and more.'),
	createIntent('edit', 'Edit', '✎', 'Change what is selected', 'Adjust, duplicate, delete, or open deeper editing.'),
	createIntent('animate', 'Animate', '◆', 'Make it move', 'Add motion now or enter the deeper animation workspace.'),
	createIntent('audio', 'Audio', '♪', 'Build the soundtrack', 'Add voice, music, sound, or open professional audio tools.'),
	createIntent('more', 'More', '•••', 'Open deeper tools', 'Commands and professional systems stay available on demand.')
]);

/** Returns one known primary intent, or null when the requested vessel does not exist. */
export function getStudioPrimaryIntent(intentId) {
	return STUDIO_PRIMARY_INTENTS.find((ohrIntent) => {
		return ohrIntent.id === intentId;
	}) || null;
}

/** Creates one frozen primary-intent descriptor. */
function createIntent(id, label, glyph, title, summary) {
	return Object.freeze({
		id,
		label,
		glyph,
		title,
		summary
	});
}
