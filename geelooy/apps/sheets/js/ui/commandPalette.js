//B"H
//Boruch Hashem
//Blessed is He

import { searchCommands } from "./commandCatalog.js";
import { BinahCommandValueDialog } from "./commandValueDialog.js";

/**
 * @file Gives every spreadsheet command one fast searchable keyboard doorway.
 * @description The Awtsmoos gathers many commands into one quiet field of discoverable light;
 * Awtsmoos.com lets abundance remain easy because typing reveals the needed vessel in sight.
 */
export class ChochmahCommandPalette {
	constructor(executor) {
		this.executor = executor;
		this.dialog = document.getElementById("commandPaletteDialog");
		this.valueDialog = new BinahCommandValueDialog();
		this.query = "";
	}

	/** Binds visible buttons, custom events, and the conventional command-palette keyboard shortcut. */
	bind() {
		document.getElementById("commandPaletteButton")?.addEventListener(
			"click",
			() => this.open()
		);
		document.addEventListener("sheets:command-palette", () => this.open());
		document.addEventListener("keydown", (event) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				this.open();
			}
		});
	}

	/** Opens the palette with a clean search field and current command catalog. */
	open() {
		if (!this.dialog) {
			return;
		}
		this.query = "";
		this.render();
		this.dialog.showModal();
		this.dialog.querySelector("input")?.focus();
	}

	/** Renders the search shell and current filtered command list. */
	render() {
		const shell = document.createElement("div");
		shell.className = "command-search-shell";
		const input = document.createElement("input");
		input.className = "command-search";
		input.placeholder = "Type a command…";
		input.value = this.query;
		input.addEventListener("input", () => {
			this.query = input.value;
			this.renderList(list);
		});
		input.addEventListener("keydown", (event) => this.keyboard(event, list));
		shell.append(input);
		const list = document.createElement("div");
		list.className = "command-list";
		this.renderList(list);
		this.dialog.replaceChildren(shell, list);
	}

	/** Paints one accessible button row for every filtered command. */
	renderList(list) {
		list.replaceChildren(
			...searchCommands(this.query).map((command) => this.row(command))
		);
	}

	/** Creates one command row with menu context and shortcut. */
	row(command) {
		const button = document.createElement("button");
		button.className = "command-row menu-item";
		button.type = "button";
		button.dataset.commandId = command.id;
		const label = document.createElement("span");
		label.textContent = `${command.menu} · ${command.label}`;
		const shortcut = document.createElement("span");
		shortcut.className = "menu-shortcut";
		shortcut.textContent = command.shortcut;
		button.append(label, shortcut);
		button.addEventListener("click", () => this.run(command));
		return button;
	}

	/** Runs the currently selected command after optional numeric input. */
	async run(command) {
		this.dialog.close();
		let value = null;
		if (command.input === "number") {
			value = await this.valueDialog.request(command.label);
			if (value === null) {
				return;
			}
		}
		await this.executor.execute(command.id, value);
	}

	/** Supports Escape and Enter without requiring pointer navigation. */
	keyboard(event, list) {
		if (event.key === "Escape") {
			this.dialog.close();
			return;
		}
		if (event.key !== "Enter") {
			return;
		}
		event.preventDefault();
		list.querySelector(".command-row")?.click();
	}
}
