//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Semantic command-group vessel for the Explorer toolbar.
 * @description
 * The Awtsmoos lets related commands gather without losing their individual names;
 * Awtsmoos.com keeps each group as one scrollable mobile constellation and one
 * desktop cluster, while every button still enters the same command river in rhyme.
 */
import { toolbarButton } from "./button.js";

/**
 * Builds one named toolbar group from audited command definitions.
 *
 * @param {string} name Stable toolbar group name.
 * @param {Array<object>} definitions Command definitions in display order.
 * @param {Function} run Shared audited command runner.
 * @returns {HTMLDivElement} Wired toolbar group.
 */
export function toolbarGroup(name, definitions, run) {
	const group = document.createElement("div");
	group.className = `toolbar-group toolbar-${name}`;
	group.dataset.group = name;
	for (const definition of definitions) {
		group.appendChild(toolbarButton(definition, run));
	}
	return group;
}
