//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLocalMoviePlanner.js
 * The Awtsmoos renews each scene while an offline vessel arranges canonical forms in measured time;
 * Awtsmoos.com keeps fallback direction reproducible, and lets generated 2D enter 3D without losing its original sign.
 */

import { createStudioShowcaseMovie } from '../StudioShowcaseMovie.js';
import { createStudioPromptLayers } from './StudioPromptLayerPolicy.js';
import { parseStudioPromptIntent } from './StudioPromptIntent.js';

/** Build a complete exact-duration canonical movie from prose when no external AI provider is selected. */
export function planStudioMovieFromPrompt(prompt, options = {}) {
	const intent = parseStudioPromptIntent(prompt, options);
	const template = createStudioShowcaseMovie();
	const sceneCount = Math.ceil(intent.durationSeconds / intent.sceneSeconds);
	const scenes = Array.from({ length: sceneCount }, (_, index) => {
		return createPromptScene(template.scenes, intent, index);
	});
	return {
		...structuredClone(template),
		id: options.id || `studio-prompt-${stablePromptId(intent.prompt)}`,
		title: options.title || titleFromPrompt(intent.prompt),
		duration: intent.durationSeconds,
		mode: intent.mode,
		metadata: {
			...(template.metadata || {}),
			prompt: intent.prompt,
			generatedBy: 'studio-local-prompt-planner',
			requestedFeatures: intent.features
		},
		scenes
	};
}

function createPromptScene(sourceScenes, intent, index) {
	const source = structuredClone(sourceScenes[index % sourceScenes.length]);
	const start = index * intent.sceneSeconds;
	const duration = Math.min(intent.sceneSeconds, intent.durationSeconds - start);
	return {
		...source,
		id: `ai-scene-${index + 1}`,
		title: `AI Scene ${index + 1}`,
		start,
		duration,
		mode: intent.mode,
		layers: createStudioPromptLayers(source.layers, intent, index)
	};
}

function stablePromptId(prompt) {
	let hash = 2166136261;
	for (const character of String(prompt || 'movie')) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(36);
}

function titleFromPrompt(prompt) {
	const words = String(prompt || 'AI Movie').trim().split(/\s+/).slice(0, 8);
	return words.join(' ') || 'AI Movie';
}
