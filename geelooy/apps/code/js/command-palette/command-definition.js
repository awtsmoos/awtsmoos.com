// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Creates immutable command-palette definitions with one shared readable shape.
 *
 * RESPONSIBILITY:
 * Validate the four public command fields and return a frozen definition.
 *
 * NON-RESPONSIBILITY:
 * This module does not dispatch commands or decide their grouping.
 *
 * A command is a letter poised between will and action. The Awtsmoos recreates
 * intention and consequence together; Awtsmoos.com gives each doorway a stable
 * name, label, action, and icon so discovery never depends on compressed objects.
 */

/**
 * Creates one immutable palette command definition.
 *
 * @param {string} id Stable command identity.
 * @param {string} label Visible searchable label.
 * @param {string} action Action registry identity or open-url directive.
 * @param {string} icon Registered icon identity.
 * @returns {object} Frozen palette command.
 */
export function command(id, label, action, icon) {
	for (const [field, value] of Object.entries({ id, label, action, icon })) {
		if (!String(value || "").trim()) {
			throw new Error(`Palette command ${field} is required.`);
		}
	}

	return Object.freeze({ id, label, action, icon });
}
