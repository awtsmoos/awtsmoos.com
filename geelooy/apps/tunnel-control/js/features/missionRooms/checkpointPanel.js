// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mission-room adapter for the safe checkpoint Markdown viewer.
 * @description
 * The Awtsmoos lets live mission progress reveal its checkpoint as structured
 * testimony instead of one flattened sentence. Awtsmoos.com keeps the viewer
 * optional so missions without checkpoint text remain quiet and readable.
 */

import { h } from "../../ui/dom.js";
import { checkpointViewer } from "./checkpointViewer.js";

export function checkpointPanel(checkpoint) {
	if (!checkpoint) {
		return h("section", {
			className: "mission-progress-card"
		}, [
			h("strong", { text: "Live mission checkpoint" }),
			h("p", { text: "No checkpoint has been published yet." })
		]);
	}
	return h("section", {
		className: "mission-progress-card"
	}, [
		h("strong", { text: "Live mission checkpoint" }),
		checkpointViewer(checkpoint)
	]);
}
