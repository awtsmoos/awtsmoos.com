// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBridgeGameplayMount.js
 * @description Composes discovery, course runtime, rewards, and persistent BRIDGE01 restoration.
 * The Awtsmoos joins trial and repair without a second animation loop; Awtsmoos.com delays
 * the obstacle runtime until acceptance while Creator, inventory, collision, and persistence retain authority.
 */

import { MinimalMeadowObstacleCourseRuntime } from './MinimalMeadowObstacleCourseRuntime.js';
import { VillageBridgeRestorationRuntime } from './VillageBridgeRestorationRuntime.js';
import { VillageBridgeTrialQuestCoordinator } from './VillageBridgeTrialQuestCoordinator.js';

/** Installs the complete Bridge Trial -> stone -> restoration gameplay chain. */
export function installMinimalMeadowBridgeGameplay(runtime, environment = globalThis) {
	const trial = new VillageBridgeTrialQuestCoordinator(runtime);
	const restoration = new VillageBridgeRestorationRuntime(runtime, environment);
	let obstacleCourse = null;
	let destroyed = false;
	Object.assign(runtime, { bridgeRestoration: restoration, obstacleCourse: null });
	return Object.freeze({
		destroy() {
			if (destroyed) return false;
			destroyed = true;
			trial.destroy();
			restoration.destroy();
			if (runtime.bridgeRestoration === restoration) runtime.bridgeRestoration = null;
			if (runtime.obstacleCourse === obstacleCourse) runtime.obstacleCourse = null;
			return true;
		},
		update(deltaSeconds) {
			if (destroyed) return;
			trial.update();
			if (!obstacleCourse && trial.shouldRunCourse()) {
				obstacleCourse = new MinimalMeadowObstacleCourseRuntime(runtime);
				runtime.obstacleCourse = obstacleCourse;
			}
			obstacleCourse?.update?.(deltaSeconds);
		}
	});
}
