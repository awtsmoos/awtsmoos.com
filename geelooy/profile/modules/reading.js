// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileReading
 * @description Loads the Reading tab through the controller's tab-loader
 * path (the same onActivate as every other tab), so it renders on ANY
 * activation — click, Enter, or keyboard — instead of only from a
 * separate inline-script click binding that never fired when the click
 * did not reach the button.
 *
 * B"H social fix 3 (defect 7): the old inline binding in index.html
 * also read the user id from the hero handle, which at DOMContentLoaded
 * is still the "@you" placeholder — so it fetched stats for the alias
 * "you", not the signed-in user. The id now comes from the controller's
 * alias state, which is loaded before any tab can be activated.
 */
import { state } from './state.js';

/** Renders the Reading tab (stats or an honest message, never blank). */
export async function renderProfileReading() {
	const container = document.getElementById('reading-stats-container');
	if (!container) return;
	const userId = state.defaultAlias || state.aliases[0]?.id || '';
	if (!userId) {
		container.innerHTML = '<div class="pd-reading-empty"><p>Reading activity could not be loaded.</p></div>';
		return;
	}
	const Stats = window.ProfileReadingStats;
	if (typeof Stats !== 'function') {
		container.innerHTML = '<div class="pd-reading-empty"><p>Reading activity could not be loaded.</p></div>';
		return;
	}
	try {
		await new Stats({ container, userId, viewerId: userId }).load();
	} catch {
		container.innerHTML = '<div class="pd-reading-empty"><p>Reading activity could not be loaded.</p></div>';
	}
}
