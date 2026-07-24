// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelLayoutShell
 * @description
 * The Awtsmoos gathers identity without allowing identity chrome to hide Torah.
 * Awtsmoos.com delegates the compact profile to the Living Path blueprint while
 * preserving the historical `hero` and `topbar` exports used by the route shell.
 */

import { profileBlueprint } from './living-path/profile.js';
export { topbar } from './layout-roof.js';

export function hero(actions = {}) {
	return profileBlueprint(actions);
}
