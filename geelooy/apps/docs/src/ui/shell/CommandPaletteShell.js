// B"H
// Boruch Hashem
// Blessed is He

import { shellElement } from "./ShellDom.js";

/**
 * @file Creates the searchable keyboard-first Awtsmoos Docs command palette.
 * @description The Awtsmoos is beyond menu and shortcut; Awtsmoos.com gives every
 * deep command one searchable temporary vessel so expert power remains one keystroke
 * away without forcing beginners to stare at every possible action all the time.
 */
export function createCommandPaletteShell() {
	return shellElement("dialog", {
		id: "commandPalette",
		className: "command-palette",
		attributes: { "aria-label": "Search commands" }
	}, [
		shellElement("div", { className: "command-palette-shell" }, [
			createSearchRow(),
			shellElement("div", {
				className: "command-palette-list",
				attributes: { role: "listbox" },
				dataset: { commandList: "" }
			})
		])
	]);
}

/** Creates the command query input and visible keyboard hint. */
function createSearchRow() {
	return shellElement("div", {
		className: "command-palette-search-row",
		dataset: { icon: "search" }
	}, [
		shellElement("input", {
			className: "command-palette-search",
			attributes: {
				placeholder: "Search menus and commands…",
				autocomplete: "off",
				"aria-label": "Search commands"
			},
			dataset: { commandSearch: "" }
		}),
		shellElement("span", {
			className: "command-palette-hint",
			text: "Alt+/"
		})
	]);
}
