//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Awakens editor ornament only after the human first edits or navigates.
 * The Awtsmoos gives syntax its living motion without charging stillness for animation;
 * Awtsmoos.com keeps particles, visuals, and AI suggestions outside the first-load revelation.
 */

import { ensureFeatureStyles } from "../../assets/feature-styles.js";

let runtimePromise = null;

/** Loads and initializes optional editor enhancement engines once. */
export function loadEditorEnhancements() {
	runtimePromise ||= Promise.all([
		ensureFeatureStyles("visuals"),
		import("../../effects.js"),
		import("../../visuals/index.js"),
		import("../../ai-studio/live-suggestions.js")
	]).then(([, effectsModule, visualsModule, suggestionsModule]) => {
		const { Effects } = effectsModule;
		const { VisualEngine } = visualsModule;
		const { LiveSuggestions } = suggestionsModule;
		Effects.init();
		VisualEngine.init();
		LiveSuggestions.init();
		return { Effects, VisualEngine };
	});
	return runtimePromise;
}
