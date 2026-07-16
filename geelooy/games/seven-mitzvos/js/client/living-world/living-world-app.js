//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldApp
 * @description
 * The browser on Awtsmoos.com chooses a compatible seven-region save or a
 * deterministic new world, mounts the shared kernel, samples frame cadence,
 * and delegates heavy save construction to a module worker.
 */
import { BrowserWorldRepository } from '../../persistence/browser-world-repository.js';
import { createLivingRegionWorld } from '../../world/living-region-fixture.js';
import { LivingWorldKernel } from '../../world/living-world-kernel.js';
import { FrameBudgetMonitor } from '../../performance/frame-budget-monitor.js';
import { BrowserSaveCoordinator } from './browser-save-coordinator.js';
import { LivingWorldView } from './living-world-view.js';
import { LivingWorldController } from './living-world-controller.js';

export function mountLivingWorld(mount) {
	const repository = new BrowserWorldRepository();
	const saves = new BrowserSaveCoordinator(repository);
	const recovered = saves.load('local');
	const compatible = isCompatible(recovered.record?.payload?.state);
	const state = compatible
		? recovered.record.payload.state
		: createLivingRegionWorld('browser-seven-regions');
	const events = compatible
		? recovered.record.payload.events
		: [];
	const kernel = new LivingWorldKernel(state, { journal: events });
	const controller = new LivingWorldController({
		kernel,
		view: new LivingWorldView(mount),
		saves,
		slotId: 'local'
	});
	controller.mount();
	startFrameMeasurement();
	globalThis.__sevenWorldsController = controller;
	return controller;
}

function isCompatible(state) {
	return Boolean(
		state &&
		state.schemaVersion >= 2 &&
		Array.isArray(state.regions) &&
		state.regions.length === 7
	);
}

function startFrameMeasurement() {
	const profile = matchMedia('(max-width: 760px)').matches
		? 'mobile'
		: 'desktop';
	const monitor = new FrameBudgetMonitor(profile, 240);
	monitor.measure().catch(error => {
		globalThis.__sevenWorldsPerformance = {
			error: error.message,
			quality: monitor.quality.current()
		};
	});
}
