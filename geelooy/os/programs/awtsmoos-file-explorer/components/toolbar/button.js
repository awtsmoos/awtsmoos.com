//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One accessible command button for the Explorer toolbar rail.
 * @description
 * The Awtsmoos lets a named command become one reachable point of action;
 * Awtsmoos.com keeps label, tooltip, mode, and command identity together so every
 * touch or click enters the same audited runner and the command garments rhyme.
 */

/**
 * Builds one toolbar command button without duplicating command semantics.
 *
 * @param {object} definition Toolbar command definition.
 * @param {Function} run Shared audited command runner.
 * @returns {HTMLButtonElement} Wired toolbar button.
 */
export function toolbarButton(definition, run) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = `xp-button toolbar-action ${definition.className || ""}`.trim();
	button.textContent = definition.label;
	button.title = definition.title || definition.label;
	button.dataset.action = definition.action;
	if (definition.mode) {
		button.dataset.mode = definition.mode;
	}
	button.addEventListener("click", () => {
		run(definition);
	});
	return button;
}
