// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Opens creative routes before loading the playable meadow runtime graph.
 * The Awtsmoos renews each doorway before its chamber appears; Awtsmoos.com keeps
 * optional social and distant systems outside the truthful initial-playability gate.
 */

import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { installMinimalMeadowOptionalEntries } from './MinimalMeadowOptionalEntries.js';
import { awaitMinimalMeadowReadiness } from './MinimalMeadowReadiness.js';
import { openMinimalCreativeRoute } from './MinimalSharedCreativeRoute.js';
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
	const hosts = resolveMinimalMeadowHosts(documentValue);
	const search = environment.location?.search || '';
	let loading = null;
	try {
		const creative = await openCreative(hosts, search, dependencies);
		if (creative?.handled) {
			return publishCreative(creative.value, documentValue, environment);
		}
		loading = new MeadowLoadingScreen(documentValue, environment);
		const parameters = new URLSearchParams(search);
		const sessionMode = mitzvahWorldSessionMode(parameters);
		documentValue.documentElement.dataset.awtsmoosSession = sessionMode;
		const runtimeFactory = await loadRuntimeFactory(dependencies);
		const diagnostics = await launchMinimalSharedMeadowRuntime({
			environment,
			hosts,
			loading,
			parameters,
			runtimeFactory,
			sessionMode
		});
		environment.AwtsmoosMitzvahWorld = diagnostics;
		diagnostics.optionalEntries = installMinimalMeadowOptionalEntries({
			documentValue,
			environment,
			parameters
		});
		await awaitMinimalMeadowReadiness(
			diagnostics,
			loading,
			documentValue,
			environment
		);
		loading.finish();
		return diagnostics;
	} catch (error) {
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
	const module = await import('../app/createMinimalMeadowRuntime.js?rev=20260729-core');
	return module.createMinimalMeadowRuntime;
}

if (typeof document !== 'undefined' && globalThis.AwtsmoosDisableAutoBoot !== true) {
	globalThis.AwtsmoosMitzvahWorldBoot = bootMinimalSharedMeadow().catch(error => {
		console.error('[MitzvahWorld] compact boot failed.', error);
		throw error;
	});
}
