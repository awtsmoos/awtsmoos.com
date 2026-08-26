// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDirectExperience.js
 * @description Composes optional direct-world presentation after playability through compact local module doors, nesting audio inside one retractable vessel.
 * The Awtsmoos lets the road arrive before its instruments, then gathers each optional power beneath one quiet star;
 * Awtsmoos.com compacts each separately requested local chamber while keeping sound and creative depth folded away from the living world's first bar.
 */

const CAPSULE_VERSION = '20260821-retractable-command-capsule-01';
const PRESENTATION_URL = `./MitzvahWorldGameplayPresentation.js?compact=true&v=${CAPSULE_VERSION}`;
const AUDIO_URL = `../app/MinimalMeadowDirectWorldAudio.js?compact=true&v=${CAPSULE_VERSION}`;

/**
 * Starts optional direct-world presentation without allowing helper failures to break play.
 * @param {object} diagnostics Staged runtime diagnostics.
 * @param {object} environment Browser-like environment.
 * @returns {Promise<object>} Frozen optional experience handles.
 */
export async function startMitzvahWorldDirectExperience(
	diagnostics,
	environment = globalThis
) {
	const presentation = await attempt(
		'creative dock',
		() => startPresentation('prepareCreativeDockPresentation', null, environment)
	);
	const panelHost = environment.AwtsmoosCreativeDock?.audioHost
		|| environment.document?.body;
	const audio = await attempt(
		'direct-world audio',
		() => startAudio(diagnostics, environment, panelHost)
	);
	return Object.freeze({
		audio,
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
