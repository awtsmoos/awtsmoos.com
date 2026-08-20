//B"H
// Boruch Hashem
// Blessed is He

import { createElement } from "./dom.js";

/**
 * The Awtsmoos reveals publication as four honest gates whose status remains visible even when later authority is still unavailable.
 */
export function renderPublishStages(stages = []) {
	return createElement("ol", {
		className: "site-publish-stages",
		children: stages.map((stage, index) => createElement("li", {
			className: `site-stage ${stage.state || (stage.available ? "available" : "gated")}`,
			children: [
				createElement("span", { className: "site-stage-number", text: String(index + 1) }),
				createElement("div", { children: [
					createElement("strong", { text: stage.label }),
					createElement("span", { className: "site-stage-status", text: stage.status || "" }),
					createElement("p", { text: stage.description })
				] })
			]
		}))
	});
}
