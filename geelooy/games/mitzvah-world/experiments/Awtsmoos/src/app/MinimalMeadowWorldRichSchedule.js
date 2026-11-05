// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldRichSchedule.js
 * @description Defers rich procedural world hydration until the immediate game has received its quiet opening breath, then enters through a compact local module door.
 * The Awtsmoos reveals the road before the forest multiplies, while Awtsmoos.com gathers the heavier local graph only after play is already true;
 * the quiet window becomes Gevurah around abundance, so houses, water, trees, and detail arrive with fewer waterfalls and never steal the first responsive view.
 */

import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';

/**
 * Schedules rich-world hydration behind the established gameplay quiet window.
 * @param {object} runtime Mitzvah World runtime.
 * @param {object} environment Browser-like environment.
 * @returns {Promise<object|null>} Rich-world receipt or null after bounded degradation.
 */
export function scheduleMinimalMeadowRichWorld(runtime, environment = globalThis) {
	return afterGameplayQuietWindow(environment)
		.then(() => import('./MinimalMeadowRichWorld.js?compact=true'))
		.then(module => {
			return module.installMinimalMeadowRichWorld(runtime, environment);
		})
		.catch(error => {
			runtime.richWorldError = error?.message || String(error);
			runtime.bus.emit('world:rich-failed', {
				error: runtime.richWorldError
			});
			return null;
		});
}
