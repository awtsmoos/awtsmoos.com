// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Opens creative routes or advances through playable and bounded full readiness.
 * The Awtsmoos gives each doorway its truthful sign while movement arrives before ornament;
 * Awtsmoos.com publishes exact boot stages and preserves visible failure instead of silent torment.
 */
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { installMinimalMeadowOptionalEntries } from './MinimalMeadowOptionalEntries.js';
import { runMinimalSharedMeadowReadiness } from './MinimalSharedMeadowReadinessFlow.js';
import {
	isMinimalMovieRequest,
	openMinimalCreativeRoute
} from './MinimalSharedCreativeRoute.js';
import { launchMinimalSharedMeadowRuntime } from './MinimalSharedMeadowRuntimeLaunch.js';
import { mitzvahWorldSessionMode } from './MitzvahWorldSessionMode.js';
import {
	resolveMinimalMeadowHosts,
	showMinimalMeadowBootFailure
} from './MinimalSharedMeadowPageSupport.js';

export async function bootMinimalSharedMeadow(
	documentValue = document,
	environment = globalThis,
	dependencies = {}
) {
	stage(documentValue, 'hosts');
	const hosts = resolveMinimalMeadowHosts(documentValue);
	const search = environment.location?.search || '';
	let loading = null;
	try {
		if (isMinimalMovieRequest(search)) {
			stage(documentValue, 'creative-route');
			const creative = await openCreative(hosts, search, dependencies);
			if (creative?.handled) {
				stage(documentValue, 'creative-ready');
				return publishCreative(creative.value, documentValue, environment);
			}
		}
		stage(documentValue, 'loading-screen');
		loading = new MeadowLoadingScreen(documentValue, environment);
		const parameters = new URLSearchParams(search);
		const sessionMode = mitzvahWorldSessionMode(parameters);
		documentValue.documentElement.dataset.awtsmoosSession = sessionMode;
		stage(documentValue, 'runtime-factory');
		const runtimeFactory = await loadRuntimeFactory(dependencies);
		stage(documentValue, 'runtime-launch');
		const diagnostics = await launchMinimalSharedMeadowRuntime({
			environment,
			hosts,
			loading,
			parameters,
			runtimeFactory,
			sessionMode
		});
		stage(documentValue, 'runtime-created');
		environment.AwtsmoosMitzvahWorld = diagnostics;
		diagnostics.optionalEntries = installMinimalMeadowOptionalEntries({
			documentValue,
			environment,
			parameters
		});
		stage(documentValue, 'readiness');
		diagnostics.readinessFlow = await runMinimalSharedMeadowReadiness({
			diagnostics,
			documentValue,
			environment,
			loading
		});
		stage(documentValue, 'ready');
		return diagnostics;
	} catch (error) {
		stage(documentValue, 'failed', error);
		loading?.fail(error);
		showMinimalMeadowBootFailure(hosts.hud, documentValue, error);
		throw error;
	}
}

async function openCreative(hosts, search, dependencies) {
	const opener = dependencies.openCreativeRoute || openMinimalCreativeRoute;
	return opener(hosts, search);
}

function publishCreative(value, documentValue, environment) {
	environment.AwtsmoosMitzvahWorld = value;
	documentValue.documentElement.dataset.awtsmoosSession = 'movie';
	return value;
}

async function loadRuntimeFactory(dependencies) {
	if (typeof dependencies.createMinimalMeadowRuntime === 'function') {
		return dependencies.createMinimalMeadowRuntime;
	}
	const module = await import('../app/createMinimalMeadowRuntime.js?rev=20260730-speed');
	return module.createMinimalMeadowRuntime;
}

function stage(documentValue, value, error = null) {
	documentValue.documentElement.dataset.awtsmoosBootStage = value;
	if (error) {
		documentValue.documentElement.dataset.awtsmoosBootError = error?.message
		|| String(error);
	}
}

if (typeof document !== 'undefined' && globalThis.AwtsmoosDisableAutoBoot !== true) {
	globalThis.AwtsmoosMitzvahWorldBoot = bootMinimalSharedMeadow().catch(error => {
		console.error('[MitzvahWorld] compact boot failed.', error);
		throw error;
	});
}
