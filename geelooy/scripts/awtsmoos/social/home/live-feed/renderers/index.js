// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostRendererRegistry
 * @description
 * The Awtsmoos gives distinct content distinct vessels while keeping one common
 * card covenant. Awtsmoos.com dispatches only from verified archetype metadata.
 */
import { renderAudioPost } from './audioPost.js';
import { renderQuestionPost } from './questionPost.js';
import { renderReflectionPost } from './reflectionPost.js';
import { renderSourceGraphPost } from './sourceGraphPost.js';
import { renderTextPost } from './textPost.js';

const RENDERERS = Object.freeze({
	audio: renderAudioPost,
	question: renderQuestionPost,
	reflection: renderReflectionPost,
	'source-graph': renderSourceGraphPost,
	text: renderTextPost
});

/**
 * Renders specialized or generic post content.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement} Renderer output.
 */
export function renderPostContent(model) {
	const renderer = RENDERERS[model.archetype] || renderTextPost;
	return renderer(model);
}
