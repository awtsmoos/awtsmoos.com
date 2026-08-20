// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayablePriority.js
 * @description Gives the canonical Chossid one bounded clear lane before canonical world enrichment begins.
 * The Awtsmoos reveals the traveler, then the valley, without making either wait forever in disguise;
 * Awtsmoos.com preserves every canonical system while ordering its arrival so smoothness and realism rise.
 */

const DISTRICT_URL = './EretzDistrictStreamingLaunch.js?v=20260820-player-priority-02';
const ENRICHMENT_URL = './EretzDeferredEnrichmentLaunch.js?v=20260820-player-priority-02';
const DEFAULT_PLAYER_PRIORITY_MILLISECONDS = 1500;

export async function startEretzPostPlayablePriority(context, dependencies = {}) {
	const { boot, core, environment, options } = context;
	const runtime = core.runtime;
	const diagnostics = core.diagnostics;
	const waitForPlayer = dependencies.waitForPlayer || waitForCanonicalPlayerWindow;
	const loadLaunchers = dependencies.loadLaunchers || loadPostPlayableLaunchers;
	diagnostics.deferredSystems = deferredSystemReceipt();
	diagnostics.postPlayablePriorityStage = 'waiting-for-canonical-player';
	const priority = await waitForPlayer(runtime, environment, options);
	if (runtime.destroyed) return destroyedReceipt(priority);
	diagnostics.postPlayablePriorityStage = 'loading-world-launchers';
	const launchers = await loadLaunchers();
	diagnostics.postPlayablePriorityStage = 'launching-world-streams';
	const districts = Promise.resolve(launchers.startDistrict(runtime, environment));
	const enrichment = Promise.resolve(launchers.startDeferred(core, options, boot));
	diagnostics.postPlayablePriorityStage = 'launched';
	return Object.freeze({
		districts,
		enrichment,
		priority,
		status: 'launched'
	});
}

export async function waitForCanonicalPlayerWindow(runtime, environment = globalThis, options = {}) {
	const canonicalPromise = runtime?.canonicalPlayerLaunchPromise
		|| runtime?.canonicalPlayerPromise;
	if (!canonicalPromise) {
		return Object.freeze({ reason: 'no-canonical-promise', waitedMs: 0 });
	}
	const policy = eretzPostPlayablePriorityPolicy(options);
	const started = now(environment);
	const reason = await Promise.race([
		Promise.resolve(canonicalPromise).then(
			() => 'canonical-settled',
			() => 'canonical-settled'
		),
		waitMilliseconds(environment, policy.playerPriorityMilliseconds)
			.then(() => 'priority-timeout')
	]);
	return Object.freeze({
		reason,
		waitedMs: Math.max(0, now(environment) - started)
	});
}

export function eretzPostPlayablePriorityPolicy(options = {}) {
	return Object.freeze({
		playerPriorityMilliseconds: Math.max(
			0,
			Number(options.playerPriorityMilliseconds ?? DEFAULT_PLAYER_PRIORITY_MILLISECONDS)
		)
	});
}

async function loadPostPlayableLaunchers() {
	const [districtModule, enrichmentModule] = await Promise.all([
		import(DISTRICT_URL),
		import(ENRICHMENT_URL)
	]);
	return {
		startDeferred: enrichmentModule.startProductionEretzDeferredEnrichment,
		startDistrict: districtModule.startEretzDistrictStreaming
	};
}

function waitMilliseconds(environment, milliseconds) {
	return new Promise(resolve => {
		const timer = environment?.setTimeout || setTimeout;
		timer(resolve, milliseconds);
	});
}

function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}

function deferredSystemReceipt() {
	return Object.freeze({
		authoredTerrain: 'post-player-priority-streaming',
		inventoryAndRpg: 'deferred',
		richActors: 'post-player-priority-streaming',
		richRenderer: 'deferred',
		worldDiagnostics: 'bootstrap-and-deferred-stream-receipts'
	});
}

function destroyedReceipt(priority) {
	return Object.freeze({
		districts: Promise.resolve(null),
		enrichment: Promise.resolve(null),
		priority,
		status: 'destroyed'
	});
}
