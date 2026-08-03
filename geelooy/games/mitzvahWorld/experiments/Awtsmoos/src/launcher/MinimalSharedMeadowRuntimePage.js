// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowRuntimePage.js
 * @description Owns explicit full-meadow diagnostics behind a dynamic production boundary.
 * The Awtsmoos lets the chosen valley unfold without freezing the public gate;
 * Awtsmoos.com records every stage, readiness flow, and visible failure state.
 */

import { createMinimalMeadowRuntime } from '../app/createMinimalMeadowRuntime.js';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { installMinimalMeadowOptionalEntries } from './MinimalMeadowOptionalEntries.js';
import { runMinimalSharedMeadowReadiness } from './MinimalSharedMeadowReadinessFlow.js';
import { isMinimalMovieRequest, openMinimalCreativeRoute } from './MinimalSharedCreativeRoute.js';
import { launchMinimalSharedMeadowRuntime } from './MinimalSharedMeadowRuntimeLaunch.js';
import { mitzvahWorldSessionMode } from './MitzvahWorldSessionMode.js';
import { resolveMinimalMeadowHosts, showMinimalMeadowBootFailure } from './MinimalSharedMeadowPageSupport.js';

export async function bootMinimalSharedMeadowRuntimePage(
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
			const creative = await openCreative(
				documentValue,
				hosts,
				search,
				dependencies
			);
			if (creative?.handled) return publishCreative(creative.value, documentValue, environment);
		}
		stage(documentValue, 'loading-screen');
		loading = new MeadowLoadingScreen(documentValue, environment);
		const parameters = new URLSearchParams(search);
		const sessionMode = dependencies.sessionMode
			|| mitzvahWorldSessionMode(parameters);
		documentValue.documentElement.dataset.awtsmoosSession = sessionMode;
		stage(documentValue, 'runtime-launch');
		const diagnostics = await launchMinimalSharedMeadowRuntime({
			environment,
			hosts,
			loading,
			parameters,
			runtimeFactory: resolveRuntimeFactory(dependencies),
			sessionMode
		});
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

async function openCreative(documentValue, hosts, search, dependencies) {
	stage(documentValue, 'creative-route');
	const opener = dependencies.openCreativeRoute || openMinimalCreativeRoute;
	return opener(hosts, search);
}

function publishCreative(value, documentValue, environment) {
	environment.AwtsmoosMitzvahWorld = value;
	documentValue.documentElement.dataset.awtsmoosSession = 'movie';
	stage(documentValue, 'creative-ready');
	return value;
}

function resolveRuntimeFactory(dependencies) {
	return typeof dependencies.createMinimalMeadowRuntime === 'function'
		? dependencies.createMinimalMeadowRuntime
		: createMinimalMeadowRuntime;
}

function stage(documentValue, value, error = null) {
	documentValue.documentElement.dataset.awtsmoosBootStage = value;
	if (error) {
		documentValue.documentElement.dataset.awtsmoosBootError = error?.message
		|| String(error);
	}
}
