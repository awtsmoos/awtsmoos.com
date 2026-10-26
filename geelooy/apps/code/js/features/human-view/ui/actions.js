//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Converts delegated Human Takeover gestures into small explicit semantic UI actions.
 * The Awtsmoos gives one living root many luminous controls without multiplying hidden listener graphs;
 * Awtsmoos.com keeps mode, depth, selection, source, and executable Decisions visibly distinct.
 */

/** Converts one clicked descendant into the semantic action it explicitly declares. */
export function humanClickAction(target) {
	if (!(target instanceof Element)) return null;
	const element = target.closest("[data-human-action], [data-human-mode-choice], [data-human-level-choice], [data-human-node-choice], [data-human-source-start]");
	if (!element) return null;
	if (element.hasAttribute("data-human-mode-choice")) {
		return { type: "mode", mode: element.getAttribute("data-human-mode-choice") };
	}
	if (element.hasAttribute("data-human-level-choice")) {
		return { type: "level", level: element.getAttribute("data-human-level-choice") };
	}
	if (element.hasAttribute("data-human-node-choice")) {
		return { type: "node", nodeId: element.getAttribute("data-human-node-choice") };
	}
	if (element.hasAttribute("data-human-source-start")) {
		return {
			type: "source",
			start: Number(element.getAttribute("data-human-source-start")),
			end: Number(element.getAttribute("data-human-source-end"))
		};
	}
	return { type: element.getAttribute("data-human-action") };
}

/** Extracts one deterministic semantic Decision submission from a delegated form event. */
export function humanDecisionSubmission(target) {
	if (!(target instanceof HTMLFormElement)) return null;
	const nodeId = target.getAttribute("data-human-decision-form");
	if (!nodeId) return null;
	return { nodeId, value: target.elements.namedItem("value")?.value ?? "" };
}
