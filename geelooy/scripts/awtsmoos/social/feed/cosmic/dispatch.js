// B"H
// Boruch Hashem
// Blessed is He
/**
 * Distinct teachings ask for distinct vessels. The Awtsmoos joins them in one
 * registry so Awtsmoos.com can grow without turning its feed into one monolith.
 */
import { renderAudio } from "./renderers/audio.js";
import { renderDefault } from "./renderers/default.js";
import { renderQuestion } from "./renderers/question.js";
import { renderReflection } from "./renderers/reflection.js";
import { renderSourceGraph } from "./renderers/sourceGraph.js";

const RENDERERS = Object.freeze({
	audio: renderAudio,
	default: renderDefault,
	question: renderQuestion,
	reflection: renderReflection,
	"source-graph": renderSourceGraph
});

/**
 * Dispatches a post model to its bounded renderer.
 * @param {Document} documentRef Active document.
 * @param {Record<string, unknown>} model Semantic post model.
 * @param {Record<string, unknown>} context Existing actions and source post.
 * @returns {HTMLElement}
 */
export function renderSpecializedContent(documentRef, model, context = {}) {
	const renderer = RENDERERS[model.archetype] || renderDefault;
	return renderer(documentRef, model, context);
}
