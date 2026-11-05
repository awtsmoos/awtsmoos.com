// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EretzBridgeFeatureMount.js
 * @description Mounts earned Bridge Trial and Levi in real Living Village without replacing its frame.
 * The Awtsmoos opens a reachable course for the living player;
 * no shortcut wins the stone, no second clock hides behind prayer.
 */

import { VILLAGE_BRIDGE_ADVENTURES } from '../gameplay/VillageBridgeAdventures.js';
import { eretzBridgeFeatureEligibility } from './EretzBridgeFeaturePolicy.js';
import { EretzBridgeActionHud } from './EretzBridgeActionHud.js';
import { EretzBridgeRestorationRuntime } from './EretzBridgeRestorationRuntime.js';
import { EretzBridgeTrialCoordinator } from './EretzBridgeTrialCoordinator.js';
import { EretzBridgeTrialCourse } from './EretzBridgeTrialCourse.js';
import { MinimalMeadowBridgeNpcTraveler } from './MinimalMeadowBridgeNpcTraveler.js';
import { orderedContextActionProviders } from './DirectWorldContextProviderRegistry.js';

/** One mount per actual Living Village; quest authority and real player position are shared. */
export function mountEretzBridgeFeature(runtime, policy, environment = globalThis, factories = {}) {
	const eligibility = eretzBridgeFeatureEligibility(policy, runtime);
	if (!eligibility.eligible) return Object.freeze({status: 'disabled', ...eligibility});
	if (runtime.bridgeGameplay) return runtime.bridgeGameplay;
	for (const definition of VILLAGE_BRIDGE_ADVENTURES) {
		if (!runtime.catalogAdventures.get(definition.id)) {
			runtime.catalogAdventures.registerQuest(definition);
		}
	}
	const trial = new (factories.Trial || EretzBridgeTrialCoordinator)(runtime);
	const restoration = new (factories.Restoration || EretzBridgeRestorationRuntime)(runtime, environment);
	const hud = new (factories.Hud || EretzBridgeActionHud)(runtime, orderedContextActionProviders(runtime), environment);
	const traveler = new (factories.Traveler || MinimalMeadowBridgeNpcTraveler)(runtime);
	let obstacleCourse = null;
	let destroyed = false;
	Object.assign(runtime, {bridgeRestoration: restoration, bridgeVillager: traveler});
	const service = {
		status: 'ready',
		get trial() { return trial; },
		get restoration() { return restoration; },
		get traveler() { return traveler; },
		get obstacleCourse() { return obstacleCourse; },
		update(deltaSeconds) {
			if (destroyed || runtime.destroyed) return;
			trial.update();
			if (!obstacleCourse && trial.shouldRunCourse()) {
				obstacleCourse = new (factories.Course || EretzBridgeTrialCourse)(runtime);
				runtime.obstacleCourse = obstacleCourse;
			}
			obstacleCourse?.update?.(deltaSeconds);
			traveler.update(deltaSeconds);
			hud.update();
		},
		destroy() {
			if (destroyed) return false;
			destroyed = true;
			hud.destroy();
			traveler.destroy();
			obstacleCourse?.destroy?.();
			trial.destroy();
			restoration.destroy();
			runtime.bridgeStateAuthorities?.destroy?.();
			if (runtime.bridgeGameplay === service) runtime.bridgeGameplay = null;
			if (runtime.bridgeRestoration === restoration) runtime.bridgeRestoration = null;
			if (runtime.bridgeVillager === traveler) runtime.bridgeVillager = null;
			if (runtime.obstacleCourse === obstacleCourse) runtime.obstacleCourse = null;
			return true;
		}
	};
	runtime.bridgeGameplay = service;
	return service;
}
