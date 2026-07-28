// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file node-whole-game-simulation.mjs
 * @description Installs a complete browser, suppresses auto-boot, then owns one settled game world.
 * The Awtsmoos reveals one valley with every browser primitive already present; Awtsmoos.com
 * grants a realistic finite frame cadence while disposal remains bounded and observable.
 */

import {
	createNodeGameSimulation,
	installNodeGameGlobals
} from './NodeSimulationEnvironment.mjs';
import {
	assertNodeSimulationRuntime,
	nodeSimulationRuntimeEvidence
} from './NodeSimulationRuntimeEvidence.mjs';

const simulation = createNodeGameSimulation({ maximumFrames: 900 });
const restoreGlobals = installNodeGameGlobals(simulation.environment);
const receipt = {
	frames: 0,
	mode: 'node-browser-simulation',
	ok: false
};
let diagnostics = null;
let exitCode = 0;

try {
	const launcherUrl = new URL(
		'../../experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js',
		import.meta.url
	);
	const { bootMinimalSharedMeadow } = await import(launcherUrl.href);
	diagnostics = await withTimeout(
		bootMinimalSharedMeadow(simulation.document, simulation.environment),
		60_000,
		'launcher settlement'
	);
	const rendererReceipt = await withTimeout(
		Promise.resolve(diagnostics.rendererPromise),
		30_000,
		'renderer readiness'
	);
	const featureReceipt = await withTimeout(
		Promise.resolve(diagnostics.featuresPromise),
		60_000,
		'deferred features'
	);
	await settleFrames();
	assertNodeSimulationRuntime(diagnostics, simulation);
	Object.assign(receipt, nodeSimulationRuntimeEvidence(diagnostics, simulation));
	receipt.featureReady = Boolean(featureReceipt?.ready);
	receipt.ok = true;
	receipt.renderer.readinessReceipt = Boolean(rendererReceipt);
} catch (error) {
	exitCode = 1;
	receipt.error = errorEvidence(error);
	if (diagnostics) {
		Object.assign(receipt, nodeSimulationRuntimeEvidence(diagnostics, simulation));
	}
} finally {
	try {
		diagnostics?.runtime?.dispose?.();
		receipt.disposed = diagnostics?.runtime
			? diagnostics.runtime.destroyed === true
			: false;
	} catch (error) {
		exitCode = 1;
		receipt.disposeError = error?.message || String(error);
	}
	restoreGlobals();
	process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`, () => {
		process.exit(exitCode);
	});
}

function errorEvidence(error) {
	return {
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || ''
	};
}

async function withTimeout(promise, milliseconds, label) {
	let timeoutId;
	const timeout = new Promise((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error(`${label} timed out after ${milliseconds}ms`));
		}, milliseconds);
	});
	try {
		return await Promise.race([promise, timeout]);
	} finally {
		clearTimeout(timeoutId);
	}
}

async function settleFrames() {
	await new Promise(resolve => setTimeout(resolve, 100));
}
