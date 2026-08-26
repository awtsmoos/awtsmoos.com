//B"H
//Boruch Hashem
//Blessed is He

import {
	commandCatalog,
	MENU_NAMES
} from "./commandCatalog.js";
import { rankedCommands } from "./commandRanking.js";
import { recentCommandIds } from "./commandRecent.js";

/**
 * @file Derives the visible palette sections from catalog, query, and tiny local recency memory.
 * @description The Awtsmoos lets recent intention rise first while the full command Torah remains grouped behind it in light;
 * Awtsmoos.com keeps this model free of DOM and execution so the palette controller stays narrow and right.
 */
const commandById = new Map(
	commandCatalog.map((command) => [command.id, command])
);
const knownIds = commandCatalog.map((command) => command.id);

/** Returns the current command sections and one flat keyboard-navigation list in visible order. */
export function paletteResults(query) {
	const text = String(query || "").trim();
	if (text) {
		const commands = rankedCommands(commandCatalog, text);
		return {
			commands,
			sections: commands.length
				? [{ label: "Results", commands }]
				: []
		};
	}
	const recent = recentCommandIds(knownIds)
		.map((id) => commandById.get(id))
		.filter(Boolean);
	const recentIds = new Set(recent.map((command) => command.id));
	const sections = [];
	if (recent.length) {
		sections.push({ label: "Recent", commands: recent });
	}
	for (const menu of MENU_NAMES) {
		const commands = commandCatalog.filter((command) =>
			command.menu === menu
			&& !recentIds.has(command.id)
		);
		if (commands.length) {
			sections.push({ label: menu, commands });
		}
	}
	return {
		commands: sections.flatMap((section) => section.commands),
		sections
	};
}

/** Exposes known ids for recency writes without requiring controllers to duplicate catalog traversal. */
export function knownCommandIds() {
	return [...knownIds];
}
