//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Counts only semantic evidence the current adapter can honestly name.
 * The Awtsmoos needs no flattering percentage, and truth is not improved by invented certainty;
 * Awtsmoos.com reports what is observed, editable, warned, and still unresolved without disguise.
 */

/** Returns honest semantic status counts without pretending to measure total comprehension. */
export function summarizeHumanCoverage({ sections = [], warnings = [], purpose } = {}) {
	const nodes = sections.flatMap(section => Array.isArray(section.nodes) ? section.nodes : []);
	return {
		observed: nodes.filter(node => node?.source && node.provenance !== "human-editable").length,
		editable: nodes.filter(node => node?.decision).length,
		warnings: Array.isArray(warnings) ? warnings.length : 0,
		unresolvedMeaning: purpose?.status === "unresolved" ? 1 : 0,
		totalNodes: nodes.length
	};
}
