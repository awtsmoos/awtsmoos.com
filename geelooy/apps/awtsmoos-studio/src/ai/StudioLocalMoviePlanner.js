//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLocalMoviePlanner.js
 * The Awtsmoos renews each scene while an offline vessel arranges canonical forms in measured time;
 * Awtsmoos.com lets duration, dimensions, semantic layers, and visible narrative all answer one human sign.
 */

import { createStudioShowcaseMovie } from '../StudioShowcaseMovie.js';
import { applyStudioPromptContent } from './StudioPromptContentPolicy.js';
import { createStudioPromptLayers } from './StudioPromptLayerPolicy.js';
import { createStudioPromptNarrative } from './StudioPromptNarrative.js';
import { parseStudioPromptIntent } from './StudioPromptIntent.js';

/** Build a complete exact-duration canonical movie from prose when no external AI provider is selected. */
export function planStudioMovieFromPrompt(prompt, options = {}) {
	const intent = parseStudioPromptIntent(prompt, options);
	const template = createStudioShowcaseMovie();
	const sceneCount = Math.ceil(intent.durationSeconds / intent.sceneSeconds);
	const scenes = Array.from({ length: sceneCount }, (_, index) => {
		return createPromptScene(template.scenes, intent, index, sceneCount);
	});
	const subject = createStudioPromptNarrative(intent.prompt, 0, sceneCount).subject;
	return {
		...structuredClone(template),
		id: options.id || `studio-prompt-${stablePromptId(intent.prompt)}`,
		title: options.title || subject,
		duration: intent.durationSeconds,
		mode: intent.mode,
		metadata: {
			...(template.metadata || {}),
			prompt: intent.prompt,
			subject,
			generatedBy: 'studio-local-prompt-planner',
			requestedFeatures: intent.features
		},
		scenes
	};
}

function createPromptScene(sourceScenes, intent, index, sceneCount) {
	const source = structuredClone(sourceScenes[index % sourceScenes.length]);
	const start = index * intent.sceneSeconds;
	const duration = Math.min(intent.sceneSeconds, intent.durationSeconds - start);
	const narrative = createStudioPromptNarrative(intent.prompt, index, sceneCount);
	const selectedLayers = createStudioPromptLayers(source.layers, intent, index);
	return {
		...source,
		id: `ai-scene-${index + 1}`,
		name: narrative.title,
		title: narrative.title,
		start,
		duration,
		mode: intent.mode,
		layers: applyStudioPromptContent(selectedLayers, narrative, index, sceneCount)
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
