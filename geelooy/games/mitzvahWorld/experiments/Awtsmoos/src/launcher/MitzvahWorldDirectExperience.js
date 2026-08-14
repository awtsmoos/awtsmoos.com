// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDirectExperience.js
 * @description Adds lightweight presentation and the existing audio runtime after staged world playability.
 * The Awtsmoos lets deep terrain remain first while useful controls arrive in rhyme; Awtsmoos.com
 * keeps creative passage and environmental sound optional, lazy, and unable to break the world in time.
 */

const PRESENTATION_URL = './MitzvahWorldGameplayPresentation.js?v=20260814-direct-audio-01';
const AUDIO_URL = '../app/MinimalMeadowDirectWorldAudio.js?v=20260814-direct-audio-02';

export async function startMitzvahWorldDirectExperience(
	diagnostics,
	environment = globalThis
) {
	const [presentation, audio] = await Promise.all([
		attempt('creative dock', () => startPresentation(
			'prepareCreativeDockPresentation',
			null,
			environment
		)),
		attempt('direct-world audio', () => startAudio(diagnostics, environment))
	]);
	return Object.freeze({ audio, presentation });
}

export async function startMitzvahWorldFullPresentation(
	hosts,
	environment = globalThis
) {
	return attempt('gameplay presentation', () => startPresentation(
		'prepareGameplayPresentation',
		hosts,
		environment
	));
}

async function startAudio(diagnostics, environment) {
	const module = await import(AUDIO_URL);
	return module.installMinimalMeadowDirectWorldAudio(
		diagnostics.runtime,
		environment.document,
		environment
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
