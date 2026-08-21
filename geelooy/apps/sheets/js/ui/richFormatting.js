//B"H
//Boruch Hashem
//Blessed is He

import {
	clearStylePatch,
	normalizedFontSize,
	normalizedHexColor,
	toggledStyle
} from "../model/style.js";

/**
 * @file Owns rich spreadsheet formatting controls and mirrors focused-cell state into visible UI.
 * @description The Awtsmoos clothes a selected field through one measured controller of visible light;
 * Awtsmoos.com keeps toolbar, menu, palette, permission, and collaborative style truth aligned and right.
 */
export class TiferesRichFormatting {
	constructor(workbook, selection, actions, onError) {
		this.workbook = workbook;
		this.selection = selection;
		this.actions = actions;
		this.onError = onError;
		this.textColor = document.getElementById("textColorPicker");
		this.fontSize = document.getElementById("fontSizeSelect");
		this.numberFormat = document.getElementById("numberFormatSelect");
		this.buttons = [...document.querySelectorAll("[data-rich-command]")];
	}

	/** Binds toolbar controls, generic formatting events, and focused-cell state refresh. */
	bind() {
		for (const button of this.buttons) {
			button.addEventListener("click", () => this.command(button.dataset.richCommand));
		}
		this.textColor?.addEventListener("change", () => this.apply({
			color: normalizedHexColor(this.textColor.value, "#1f2937")
		}));
		this.fontSize?.addEventListener("change", () => this.apply({
			fontSize: normalizedFontSize(this.fontSize.value)
		}));
		this.numberFormat?.addEventListener("change", () => this.apply({
			numberFormat: this.numberFormat.value
		}));
		document.addEventListener("sheets:format", (event) => this.apply(event.detail || {}));
		this.selection.addEventListener("change", () => this.refresh());
		this.workbook.addEventListener("change", () => this.refresh());
		this.refresh();
	}

	/** Routes named toggle/clear formatting commands into explicit style patches. */
	command(command) {
		const toggles = {
			"format.italic": "italic",
			"format.underline": "underline",
			"format.strike": "strike",
			"format.wrap": "wrap"
		};
		if (command === "format.clear") {
			this.apply(clearStylePatch());
			return;
		}
		const key = toggles[command];
		if (key) {
			this.apply(toggledStyle(this.workbook, this.selection.focus, key));
		}
	}

	/** Applies one style patch across the current selection when edit capability is present. */
	async apply(style) {
		if (!this.workbook.data.canEdit) {
			return;
		}
		try {
			await this.actions.style(this.selection.addresses(), style);
		} catch (error) {
			this.onError?.(error);
		}
	}

	/** Reflects focused-cell formatting and edit capability into toolbar control state. */
	refresh() {
		const style = this.workbook.cell(this.selection.focus)?.style || {};
		for (const button of this.buttons) {
			const key = button.dataset.richCommand?.replace("format.", "");
			button.setAttribute("aria-pressed", String(Boolean(style[key])));
			button.disabled = !this.workbook.data.canEdit;
		}
		if (this.textColor) {
			this.textColor.value = normalizedHexColor(style.color, "#1f2937");
			this.textColor.disabled = !this.workbook.data.canEdit;
		}
		if (this.fontSize) {
			ensureOption(this.fontSize, normalizedFontSize(style.fontSize || 14));
			this.fontSize.disabled = !this.workbook.data.canEdit;
		}
		if (this.numberFormat) {
			this.numberFormat.value = style.numberFormat || "plain";
			this.numberFormat.disabled = !this.workbook.data.canEdit;
		}
	}
}

/** Ensures a custom bounded font size remains representable even when absent from preset options. */
function ensureOption(select, value) {
	const text = String(value);
	if (![...select.options].some((option) => option.value === text)) {
		const option = document.createElement("option");
		option.value = text;
		option.textContent = text;
		select.append(option);
	}
	select.value = text;
}
