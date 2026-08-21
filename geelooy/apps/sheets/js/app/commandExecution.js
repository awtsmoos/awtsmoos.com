//B"H
//Boruch Hashem
//Blessed is He

import { BinahDataCommands } from "./dataCommands.js";
import { styleForFormatCommand } from "./formatCommandStyle.js";
import { MalchusStructureCommands } from "./structureCommands.js";

/**
 * @file Routes discoverable commands into trusted structure, data, formatting, UI, and workbook actions.
 * @description The Awtsmoos lets one named intention find its proper vessel without duplicated light;
 * Awtsmoos.com keeps discovery broad while every command enters one guarded execution rite.
 */
export class KeterCommandExecution {
	constructor(context) {
		this.context = context;
		this.structure = new MalchusStructureCommands(
			context.actions,
			context.selection,
			context.workbook
		);
		this.data = new BinahDataCommands(
			context.actions,
			context.selection,
			context.workbook
		);
	}

	/** Executes one catalog command through the first matching trusted owner. */
	async execute(command, value = null) {
		if (await this.structure.execute(command, value)) {
			return true;
		}
		if (await this.data.execute(command)) {
			return true;
		}
		if (this.executeFormatting(command)) {
			return true;
		}
		const button = existingButton(command);
		if (button) {
			button.click();
			return true;
		}
		const eventName = advancedEvent(command);
		if (eventName) {
			document.dispatchEvent(new CustomEvent(eventName));
			return true;
		}
		if (command === "insert.sheet") {
			await this.context.actions.addSheet();
			return true;
		}
		return false;
	}

	/** Emits menu/palette style commands through the shared rich-formatting controller. */
	executeFormatting(command) {
		let style = styleForFormatCommand(command);
		if (command === "format.wrap") {
			const current = this.context.workbook.cell(
				this.context.selection.focus
			)?.style?.wrap;
			style = { wrap: !Boolean(current) };
		}
		if (!style) {
			return false;
		}
		document.dispatchEvent(new CustomEvent("sheets:format", {
			detail: style
		}));
		return true;
	}
}

/** Resolves commands already backed by visible tested toolbar/button controllers. */
function existingButton(command) {
	const selectors = {
		"file.new": '[data-command="new"]',
		"file.import": '[data-command="import"]',
		"file.export": '[data-command="export"]',
		"edit.copy": '[data-command="copy"]',
		"edit.paste": '[data-command="paste"]',
		"insert.note": '[data-command="note"]',
		"format.bold": '[data-command="bold"]',
		"format.italic": '[data-rich-command="format.italic"]',
		"format.underline": '[data-rich-command="format.underline"]',
		"format.strike": '[data-rich-command="format.strike"]'
	};
	return selectors[command]
		? document.querySelector(selectors[command])
		: null;
}

/** Maps advanced command ids onto isolated feature-surface events. */
function advancedEvent(command) {
	const events = {
		"edit.pasteSpecial": "sheets:paste-special",
		"data.formulas": "sheets:formula-library",
		"tools.formulas": "sheets:formula-library",
		"tools.palette": "sheets:command-palette",
		"extensions.plugins": "sheets:plugins",
		"extensions.forms": "sheets:create-form"
	};
	return events[command] || "";
}
