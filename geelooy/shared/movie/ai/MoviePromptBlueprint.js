// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePromptBlueprint.js
 * @description Converts a human prompt into a portable intent while leaving structured intent open to real AI callers.
 * The Awtsmoos lets a few words become a doorway rather than a cage; Awtsmoos.com keeps the full structured API available beyond this friendly stage.
 */
export function createMoviePromptIntent(prompt, options = {}) {
	const cleanPrompt = String(prompt || '').trim();
	const mode = normalizeMode(options.mode || inferMode(cleanPrompt));
	const duration = clampDuration(options.duration);

	return {
		title: titleFromPrompt(cleanPrompt),
		subject: cleanPrompt || 'Create a vivid editable movie',
		goal: cleanPrompt || 'Create a vivid editable movie',
		audience: options.audience || 'general',
		duration,
		metadata: {
			requestedMode: mode,
			promptSource: 'mobile-ai-director'
		},
		settings: {
			width: 1280,
			height: 720,
			fps: 24,
			background: '#050816'
		}
	};
}

function inferMode(prompt) {
	const value = prompt.toLowerCase();
	if (value.includes('tutorial') || value.includes('teach')) return 'tutorial';
	if (value.includes('chart') || value.includes('infographic')) return 'infographic';
	if (value.includes('3d') || value.includes('cinematic')) return 'cinematic';
	if (value.includes('character') || value.includes('people')) return 'character';
	return 'hybrid';
}

function normalizeMode(mode) {
	const allowed = ['hybrid', 'cinematic', 'character', 'tutorial', 'infographic'];
	return allowed.includes(mode) ? mode : 'hybrid';
}

function clampDuration(value) {
	const milliseconds = Number(value) || 60000;
	return Math.min(600000, Math.max(15000, milliseconds));
}

function titleFromPrompt(prompt) {
	if (!prompt) return 'AI Movie';
	const short = prompt.split(/\s+/).slice(0, 8).join(' ');
	return short.length < prompt.length ? `${short}…` : short;
}
