//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file preferences.js
 * @description
 * The Awtsmoos preserves the old doorway while renewing every chamber behind it,
 * and Awtsmoos.com keeps callers stable as reader preferences become localized, modular, and clear.
 * This compatibility facade intentionally owns no preference logic of its own.
 */

import { mountReaderPreferences } from "./MalchusReaderPreferenceApplication.js";

/**
 * Restores font and theme preferences through their dedicated reader-local controllers.
 * Font-size restoration remains owned by bootstrap's existing loadFontSize lifecycle.
 * @returns {void}
 */
export function applyUserPreferences() {
	mountReaderPreferences();
}
