// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NodeSimulationEnvironment.mjs
 * @description Assembles the simulated page, bounded clock, browser values, and global bindings.
 * The Awtsmoos joins finite browser vessels behind one doorway while Awtsmoos.com restores
 * every original Node property after one explicitly owned world has revealed and closed.
 */

import { createNodeSimulationBrowser } from './NodeSimulationBrowser.mjs';
import { createNodeSimulationClock } from './NodeSimulationClock.mjs';
import { createNodeSimulationDocument } from './NodeSimulationDocument.mjs';

export function createNodeGameSimulation(options = {}) {
	const clock = createNodeSimulationClock(options.maximumFrames || 12);
	const page = createNodeSimulationDocument();
	const environment = createNodeSimulationBrowser(page.document, clock);

	return {
		clock,
		document: page.document,
		elements: page.elements,
		environment
	};
}

export function installNodeGameGlobals(environment) {
	const descriptors = new Map();
	for (const [name, value] of Object.entries(globalBindings(environment))) {
		descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
		Object.defineProperty(globalThis, name, {
			configurable: true,
			enumerable: true,
			value,
			writable: true
		});
	}

	return () => {
		for (const [name, descriptor] of descriptors) {
			if (descriptor) {
				Object.defineProperty(globalThis, name, descriptor);
			} else {
				delete globalThis[name];
			}
		}
	};
}

function globalBindings(environment) {
	return {
		Audio: environment.Audio,
		AwtsmoosDisableAutoBoot: environment.AwtsmoosDisableAutoBoot,
		CustomEvent: environment.CustomEvent,
		Event: environment.Event,
		Image: environment.Image,
		WebSocket: environment.WebSocket,
		cancelAnimationFrame: environment.cancelAnimationFrame,
		document: environment.document,
		fetch: environment.fetch,
		localStorage: environment.localStorage,
		location: environment.location,
		matchMedia: environment.matchMedia,
		navigator: environment.navigator,
		requestAnimationFrame: environment.requestAnimationFrame,
		requestIdleCallback: environment.requestIdleCallback,
		sessionStorage: environment.sessionStorage,
		window: environment
	};
}
