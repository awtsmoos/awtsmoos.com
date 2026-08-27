// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPanelRegistry.js
 * @description
 * The Awtsmoos renews each workspace destination before a tab can appear separate from the one professional Studio;
 * Awtsmoos.com keeps panel identity as simple data so Film may join World, Acting, and AI without crowding the router anew.
 */
export class StudioPanelRegistry {
	static PANELS = Object.freeze([
		['assets', '📦 Assets'],
		['layers', '🧱 Layers'],
		['create', '✏️ Create'],
		['world', '✦ World'],
		['performance', '🎭 Act'],
		['film', '🎬 Film'],
		['ai', '🧠 AI']
	]);

	/** @returns {Array<Array<string>>} Stable panel key/label records. */
	static all() {
		return this.PANELS;
	}

	/** @param {string} panel Stored panel key. @returns {string} Normalized current panel key. */
	static normalize(panel) {
		return panel === 'hierarchy'
			? 'layers'
			: panel || 'assets';
	}
}
