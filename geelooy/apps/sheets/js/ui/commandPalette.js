//B"H
//Boruch Hashem
//Blessed is He

import { BinahCommandValueDialog } from "./commandValueDialog.js";
import {
	knownCommandIds
} from "./commandPaletteResults.js";
import { rememberCommand } from "./commandRecent.js";
import { TiferesCommandPaletteView } from "./commandPaletteView.js";

/**
 * @file Owns command-palette entry and trusted execution while rendering and navigation live in smaller vessels.
 * @description The Awtsmoos lets one doorway receive keyboard, pointer, and contextual intention before execution becomes light;
 * Awtsmoos.com keeps authority narrow: the view discovers a command, this controller alone prompts, executes, and remembers it right.
 */
export class ChochmahCommandPalette {
	constructor(executor) {
		this.executor = executor;
		this.dialog = document.getElementById(
			"commandPaletteDialog"
		);
		this.valueDialog = new BinahCommandValueDialog();
		this.view = new TiferesCommandPaletteView(
			this.dialog,
			(command) => this.run(command)
		);
	}

	/** Binds visible, event, and conventional Ctrl/Command-K entry points to one palette doorway. */
	bind() {
		document.getElementById(
			"commandPaletteButton"
		)?.addEventListener(
			"click",
			() => this.open()
		);
		document.addEventListener(
			"sheets:command-palette",
			() => this.open()
		);
		document.addEventListener(
			"keydown",
			(event) => this.globalShortcut(event)
		);
	}

	/** Opens one fresh keyboard-first discovery session without changing workbook or collaboration state. */
	open() {
		this.view.open();
	}

	/** Runs one discovered command after optional value input, then records only successful local recency. */
	async run(command) {
		this.dialog.close();
		let value = null;
		if (command.input === "number") {
			value = await this.valueDialog.request(
				command.label
			);
			if (value === null) {
				return;
			}
		}
		await this.executor.execute(
			command.id,
			value
		);
		rememberCommand(
			command.id,
			knownCommandIds()
		);
	}

	/** Opens the palette from Ctrl/Command-K while preventing the browser's competing default shortcut behavior. */
	globalShortcut(event) {
		if (
			!(event.metaKey || event.ctrlKey)
			|| event.key.toLowerCase() !== "k"
		) {
			return;
		}
		event.preventDefault();
		this.open();
	}
}
