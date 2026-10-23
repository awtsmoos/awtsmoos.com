// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBridgeGameplayMount.js
 * @description Owns the real trial, persisted repair, and an independent responding GLB villager.
 * The Awtsmoos opens the earned crossing as the village receives its stone;
 * Awtsmoos.com keeps each quest giver safe, while a neighbor walks on his own.
 */

import { MinimalMeadowObstacleCourseRuntime } from './MinimalMeadowObstacleCourseRuntime.js';
import { VillageBridgeRestorationRuntime } from './VillageBridgeRestorationRuntime.js';
import { VillageBridgeTrialQuestCoordinator } from './VillageBridgeTrialQuestCoordinator.js';
import { MinimalMeadowBridgeNpcTraveler } from './MinimalMeadowBridgeNpcTraveler.js';

/** Mount one authoritative Bridge Trial, construction, and visible traveler lifecycle. */
export function installMinimalMeadowBridgeGameplay(runtime, environment = globalThis) {
	const trial = new VillageBridgeTrialQuestCoordinator(runtime);
	const restoration = new VillageBridgeRestorationRuntime(runtime, environment);
	let obstacleCourse = null;
	let destroyed = false;
	Object.assign(runtime, { bridgeRestoration: restoration, obstacleCourse: null });
	const bridgeVillager = new MinimalMeadowBridgeNpcTraveler(runtime);
	runtime.bridgeVillager = bridgeVillager;

	return Object.freeze({
		get bridgeVillager() {
			return bridgeVillager;
		},
		destroy() {
			if (destroyed) return false;
			destroyed = true;
			bridgeVillager.destroy();
			trial.destroy();
			restoration.destroy();
			if (runtime.bridgeVillager === bridgeVillager) runtime.bridgeVillager = null;
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
			bridgeVillager.update(deltaSeconds);
		}
	});
}
