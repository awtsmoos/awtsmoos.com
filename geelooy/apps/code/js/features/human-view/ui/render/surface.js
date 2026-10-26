//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Routes one normalized semantic document into its current human presentation surface.
 * The Awtsmoos is not changed when the same truth becomes prose, constellation, choice, or source;
 * Awtsmoos.com keeps presentation switching pure so no visual mode can silently rewrite semantic state.
 */

import { normalizeHumanMode } from "../modes.js";
import { renderBehaviorStudio } from "./behavior.js";
import { renderHumanDocument } from "./document.js";
import { renderSemanticMap } from "./map.js";
import { renderSourceSurface } from "./source.js";

/** Renders the selected view over the same semantic document. */
export function renderHumanSurface(documentModel, mode, selectedNode) {
	switch (normalizeHumanMode(mode)) {
		case "map":
			return renderSemanticMap(documentModel);
		case "behavior":
			return renderBehaviorStudio(documentModel);
		case "source":
			return renderSourceSurface(documentModel, selectedNode);
		default:
			return renderHumanDocument(documentModel);
	}
}
