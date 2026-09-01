//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPromptContentPolicy.js
 * The Awtsmoos renews inherited layers until visible words belong to the movie now being born;
 * Awtsmoos.com preserves geometry and motion while prompt-specific titles and steps replace yesterday's form.
 */

import { MovieLayerKind } from '../../../shared/movie/MovieKinds.js';

const TEXT_KINDS = new Set([
	MovieLayerKind.TEXT,
	MovieLayerKind.CAPTION
]);

/** Retarget visible semantic content without disturbing transforms, animation, style, or layer identity. */
export function applyStudioPromptContent(layers, narrative, sceneIndex, totalScenes) {
	return (layers || []).map(layer => {
		const clone = structuredClone(layer);
		if (TEXT_KINDS.has(clone.kind)) {
			clone.content = {
				...(clone.content || {}),
				text: narrative.title,
				subtitle: narrative.subtitle
			};
		}
		if (clone.kind === MovieLayerKind.OVERLAY) {
			clone.content = {
				...(clone.content || {}),
				badge: `${sceneIndex + 1}/${totalScenes}`,
				tutorialStep: narrative.tutorialStep
			};
		}
		return clone;
	});
}
