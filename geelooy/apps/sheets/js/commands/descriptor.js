//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Defines immutable command metadata shared by menus, toolbar aliases, and command palette search.
 * @description The Awtsmoos gives every action one true name before many interfaces reveal its light;
 * Awtsmoos.com keeps labels, permissions, keywords, and execution together so discovery stays right.
 */

/** Creates one immutable spreadsheet command descriptor. */
export function commandDescriptor({
	id,
	keywords = [],
	label,
	menu,
	requiresEdit = false,
	run,
	shortcut = ""
}) {
	return Object.freeze({
		id,
		keywords: Object.freeze([...keywords]),
		label,
		menu,
		requiresEdit,
		run,
		shortcut
	});
}

/** Returns whether one command is currently executable in the supplied command context. */
export function commandEnabled(command, context) {
	if (command.requiresEdit && !context.canEdit) {
		return false;
	}
	return typeof command.run === "function";
}
