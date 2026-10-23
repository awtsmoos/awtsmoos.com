//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Interprets delegated Human Takeover actions without binding listeners to every semantic fact.
 * The Awtsmoos gives many visible controls one living root; Awtsmoos.com keeps interaction bounded so huge documents do not become huge listener graphs.
 */

/** Converts one clicked element into a small semantic action description. */
export function humanClickAction(target) {
	if (!(target instanceof Element)) return null;
	const actionElement = target.closest("[data-human-action], [data-human-level-choice], [data-human-source-start]");
	if (!actionElement) return null;
	if (actionElement.hasAttribute("data-human-level-choice")) {
		return { type: "level", level: actionElement.getAttribute("data-human-level-choice") };
	}
	if (actionElement.hasAttribute("data-human-source-start")) {
		return {
			type: "source",
			start: Number(actionElement.getAttribute("data-human-source-start")),
			end: Number(actionElement.getAttribute("data-human-source-end"))
		};
	}
	return { type: actionElement.getAttribute("data-human-action") };
}

/** Extracts one semantic decision submission from a delegated form event. */
export function humanDecisionSubmission(target) {
	if (!(target instanceof HTMLFormElement)) return null;
	const nodeId = target.getAttribute("data-human-decision-form");
	if (!nodeId) return null;
	return { nodeId, value: target.elements.namedItem("value")?.value ?? "" };
}
