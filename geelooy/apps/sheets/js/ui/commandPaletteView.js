//B"H
//Boruch Hashem
//Blessed is He

import { GevurahPaletteNavigation } from "./commandPaletteNavigation.js";
import {
	commandEmptyState,
	commandRow,
	commandSection
} from "./commandPaletteRows.js";
import { paletteResults } from "./commandPaletteResults.js";

/**
 * @file Owns the transient command-palette search session while execution remains with the trusted controller.
 * @description The Awtsmoos lets query, visible rows, and keyboard motion gather in one temporary vessel of light;
 * Awtsmoos.com keeps rendering apart from command authority so discovery may evolve while execution stays right.
 */
export class TiferesCommandPaletteView {
	constructor(dialog, runCommand) {
		this.dialog = dialog;
		this.runCommand = runCommand;
		this.navigation = new GevurahPaletteNavigation();
		this.query = "";
		this.visibleCommands = [];
	}

	/** Opens one fresh palette session and focuses the universal action search field. */
	open() {
		if (!this.dialog) {
			return;
		}
		this.query = "";
		this.navigation.reset();
		this.render();
		this.dialog.showModal();
		this.dialog.querySelector("input")?.focus();
	}

	/** Builds the stable search shell and current result list. */
	render() {
		const shell = document.createElement("div");
		shell.className = "command-search-shell";
		const input = document.createElement("input");
		input.className = "command-search";
		input.placeholder = "Search actions, menus, features…";
		input.value = this.query;
		const list = document.createElement("div");
		list.className = "command-list";
		list.setAttribute("role", "listbox");
		input.addEventListener("input", () => {
			this.query = input.value;
			this.navigation.reset();
			this.renderList(list);
		});
		input.addEventListener(
			"keydown",
			(event) => this.keyboard(event, list)
		);
		shell.append(input);
		this.renderList(list);
		this.dialog.replaceChildren(shell, list);
	}

	/** Renders grouped or ranked results while preserving one pointer/keyboard index. */
	renderList(list) {
		const result = paletteResults(this.query);
		this.visibleCommands = result.commands;
		this.navigation.clamp(result.commands.length);
		if (!result.sections.length) {
			list.replaceChildren(commandEmptyState(this.query));
			return;
		}
		const nodes = [];
		let index = 0;
		for (const section of result.sections) {
			nodes.push(commandSection(section.label));
			for (const command of section.commands) {
				nodes.push(commandRow(command, index, {
					onActivate: (rowIndex) => this.navigation.activate(rowIndex, list),
					onRun: (item) => this.runCommand(item)
				}));
				index += 1;
			}
		}
		list.replaceChildren(...nodes);
		this.navigation.sync(list, false);
	}

	/** Handles the complete keyboard interaction contract inside the palette search field. */
	keyboard(event, list) {
		if (event.key === "Escape") {
			this.dialog.close();
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			this.navigation.move(
				event.key === "ArrowDown" ? 1 : -1,
				this.visibleCommands.length,
				list
			);
			return;
		}
		if (event.key === "Enter") {
			const command = this.navigation.selected(this.visibleCommands);
			if (command) {
				event.preventDefault();
				this.runCommand(command);
			}
		}
	}
}
