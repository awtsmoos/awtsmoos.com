//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDirectExperience.js
 * @description Composes deferred direct-world presentation after playability, including the production-bound cinematic rail.
 * The Awtsmoos lets first control arrive before its instruments, then gathers beauty, sound, and visible action around the runtime already alive.
 * The player's own rail and Bag are essential instruments: they start first and never queue
 * behind the optional creative dock, whose stylesheet, idle slot, and module graph may take
 * as long as they take. Each attempt still degrades alone; none may starve the others.
 */

const CAPSULE_VERSION = '20260821-retractable-command-capsule-01';
const PRESENTATION_URL = `./MitzvahWorldGameplayPresentation.js?compact=true&v=${CAPSULE_VERSION}`;
const DIRECT_PLAY_URL = `./MitzvahWorldDirectPlayPresentation.js?compact=true&v=${CAPSULE_VERSION}`;
const AUDIO_URL = `../app/MinimalMeadowDirectWorldAudio.js?compact=true&v=${CAPSULE_VERSION}`;

/**
 * Starts optional direct-world presentation without allowing helper failures to break play.
 * @param {object} diagnostics Staged runtime diagnostics.
 * @param {object} environment Browser-like environment.
 * @param {object} dependencies Optional attempt starters for tests.
 * @returns {Promise<object>} Frozen optional experience handles.
 */
export async function startMitzvahWorldDirectExperience(
	diagnostics,
	environment = globalThis,
	dependencies = {}
) {
	const startDock = dependencies.startCreativeDockPresentation
		|| (() => startPresentation(
			'prepareCreativeDockPresentation',
			null,
			environment
		));
	const startDirectPlay = dependencies.startDirectPlayPresentation
		|| (() => startDirectPlayPresentation(diagnostics, environment));
	const startWorldAudio = dependencies.startDirectWorldAudio
		|| (panelHost => startAudio(diagnostics, environment, panelHost));
	const directPlayPromise = attempt('direct-play presentation', startDirectPlay);
	const presentation = await attempt('creative dock', startDock);
	const directPlayPresentation = await directPlayPromise;
	const panelHost = environment.AwtsmoosCreativeDock?.audioHost
		|| environment.document?.body;
	const audio = await attempt(
		'direct-world audio',
		() => startWorldAudio(panelHost)
	);
	return Object.freeze({
		audio,
		directPlayPresentation,
		presentation
	});
}

/** Starts the existing full gameplay presentation for explicitly advanced routes. */
export async function startMitzvahWorldFullPresentation(
	hosts,
	environment = globalThis
) {
	return attempt(
		'gameplay presentation',
		() => startPresentation('prepareGameplayPresentation', hosts, environment)
	);
}

async function startDirectPlayPresentation(diagnostics, environment) {
	const module = await import(DIRECT_PLAY_URL);
	return module.startMitzvahWorldDirectPlayPresentation(diagnostics, environment);
}

async function startAudio(diagnostics, environment, panelHost) {
	const module = await import(AUDIO_URL);
	return module.installMinimalMeadowDirectWorldAudio(
		diagnostics.runtime,
		environment.document,
		environment,
		panelHost
	);
}

async function startPresentation(method, hosts, environment) {
	const module = await import(PRESENTATION_URL);
	const presentation = method === 'prepareGameplayPresentation'
		? module[method](hosts, environment.document, environment)
		: module[method](environment.document, environment);
	await presentation?.ready;
	return presentation;
}

async function attempt(label, operation) {
	try {
		return await operation();
	} catch (error) {
		console.warn(`[MitzvahWorld] ${label} degraded.`, error);
		return null;
	}
}
