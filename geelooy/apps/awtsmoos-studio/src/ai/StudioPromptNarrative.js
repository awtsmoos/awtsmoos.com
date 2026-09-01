//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPromptNarrative.js
 * The Awtsmoos renews a human subject until each scene receives a distinct and truthful name;
 * Awtsmoos.com keeps the offline director deterministic while the visible story still answers the user's flame.
 */

const STORY_PHASES = Object.freeze([
	'Introduce',
	'Explore',
	'Demonstrate',
	'Explain',
	'Resolve',
	'Recap'
]);

/** Derive one visible narrative beat from the user's prompt and scene position. */
export function createStudioPromptNarrative(prompt, index, totalScenes) {
	const subject = extractStudioPromptSubject(prompt);
	const phase = selectNarrativePhase(index, totalScenes);
	return {
		subject,
		phase,
		title: `${phase}: ${subject}`,
		subtitle: `Part ${index + 1} of ${totalScenes} · ${subject}`,
		tutorialStep: phase
	};
}

/** Extract a concise topic while stripping movie-production instructions from fallback prose. */
export function extractStudioPromptSubject(prompt) {
	const text = String(prompt || '').replace(/\s+/g, ' ').trim();
	const explicit = text.match(/\b(?:about|explaining|explain|teaching|teach)\s+(.+?)(?=\s+(?:with|using|featuring|including)\b|[.!?]|$)/i);
	if (explicit?.[1]) {
		return titleCase(trimSubject(explicit[1]));
	}
	const stripped = text
		.replace(/^\s*(?:create|make|generate|build|direct)\s+(?:a|an|the)?\s*/i, '')
		.replace(/\b\d+(?:\.\d+)?\s*(?:seconds?|secs?|minutes?|mins?)\b/gi, '')
		.replace(/\b(?:2d|3d|hybrid|movie|film|video|tutorial|explainer)\b/gi, '')
		.replace(/\s+with\s+.+$/i, '')
		.replace(/\s+/g, ' ')
		.trim();
	return titleCase(trimSubject(stripped || 'Your Story'));
}

function selectNarrativePhase(index, totalScenes) {
	if (totalScenes <= 1) return 'Reveal';
	const progress = index / Math.max(1, totalScenes - 1);
	const phaseIndex = Math.round(progress * (STORY_PHASES.length - 1));
	return STORY_PHASES[Math.min(STORY_PHASES.length - 1, phaseIndex)];
}

function trimSubject(value) {
	const clean = String(value || '').replace(/^[,:;\-\s]+|[,:;\-\s]+$/g, '').trim();
	return clean.split(/\s+/).slice(0, 8).join(' ') || 'Your Story';
}

function titleCase(value) {
	return String(value || '').replace(/\b([a-z])/g, letter => letter.toUpperCase());
}
