// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NodeLauncherStageProbe.mjs
 * @description Records which asynchronous launcher vessel remains unresolved in Node simulation.
 * The Awtsmoos reveals every hidden wait through finite receipts; Awtsmoos.com distinguishes
 * core, renderer, features, rich world, readiness, and paint without changing production behavior.
 */

import {
	createNodeGameSimulation,
	installNodeGameGlobals
} from '../2026-07-26-minimal-meadow-contract-repair/NodeSimulationEnvironment.mjs';

const simulation = createNodeGameSimulation({ maximumFrames: 900 });
const restore = installNodeGameGlobals(simulation.environment);
const state = {
	boot: 'pending',
	features: 'unknown',
	renderer: 'unknown',
	samples: []
};

try {
	const moduleUrl = new URL(
		'../../experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js',
		import.meta.url
	);
	const { bootMinimalSharedMeadow } = await import(moduleUrl.href);
	const bootPromise = bootMinimalSharedMeadow(
		simulation.document,
		simulation.environment
	);
	bootPromise.then(
		diagnostics => {
			state.boot = 'resolved';
			state.diagnostics = diagnosticsReceipt(diagnostics);
		},
		error => {
			state.boot = 'rejected';
			state.bootError = error?.message || String(error);
		}
	);
	for (const milliseconds of [5000, 15000, 30000]) {
		await delay(milliseconds - (state.samples.at(-1)?.milliseconds || 0));
		attachPromiseObservers(simulation.environment.AwtsmoosMitzvahWorld, state);
		state.samples.push(sample(simulation, milliseconds));
	}
} finally {
	restore();
	console.log(JSON.stringify(state, null, 2));
	process.exit(0);
}

function attachPromiseObservers(diagnostics, stateValue) {
	if (!diagnostics || stateValue.observersAttached) return;
	stateValue.observersAttached = true;
	Promise.resolve(diagnostics.featuresPromise).then(
		value => {
			stateValue.features = 'resolved';
			stateValue.featuresValue = Boolean(value?.ready);
		},
		error => {
			stateValue.features = 'rejected';
			stateValue.featuresError = error?.message || String(error);
		}
	);
	Promise.resolve(diagnostics.rendererPromise).then(
		() => stateValue.renderer = 'resolved',
		error => {
			stateValue.renderer = 'rejected';
			stateValue.rendererError = error?.message || String(error);
		}
	);
}

function sample(simulationValue, milliseconds) {
	const diagnostics = simulationValue.environment.AwtsmoosMitzvahWorld;
	const runtime = diagnostics?.runtime;
	return {
		dataset: { ...simulationValue.document.documentElement.dataset },
		featureStatus: runtime?.featureStatus || null,
		frames: simulationValue.clock.count,
		milliseconds,
		richWorldFailures: runtime?.richWorldFailures || null,
		richWorldMountStatus: runtime?.richWorldMountStatus || null,
		runtimePresent: Boolean(runtime)
	};
}

function diagnosticsReceipt(diagnostics) {
	return {
		featureStatus: diagnostics.runtime?.featureStatus || null,
		readinessReceipt: diagnostics.readinessReceipt || null,
		renderer: diagnostics.runtime?.renderer?.backend || null
	};
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
