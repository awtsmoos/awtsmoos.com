//B"H
//Boruch Hashem
//Blessed is He

import { BinahSheetRenameDialog } from "./sheetRenameDialog.js";

/**
 * @file Renders workbook tabs and routes rename through a designed Sheets dialog instead of browser-native prompt chrome.
 * @description The Awtsmoos reveals many pages inside one workbook while each tab keeps its measured name in light;
 * Awtsmoos.com lets activation and renaming remain visually owned, accessible, and free from raw browser sight.
 */
export class HodSheetTabs {
	constructor(workbook, callbacks = {}) {
		this.workbook = workbook;
		this.callbacks = callbacks;
		this.root = document.getElementById("sheetTabs");
		this.renameDialog = new BinahSheetRenameDialog();
		document.getElementById("addSheetButton")?.addEventListener(
			"click",
			() => this.callbacks.onAdd?.()
		);
		this.workbook.addEventListener(
			"change",
			() => this.render()
		);
		this.render();
	}

	/** Rebuilds the tab strip from authoritative workbook sheet metadata with component-owned tab controls. */
	render() {
		const fragment = document.createDocumentFragment();
		for (const sheet of this.workbook.data.sheets || []) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "sheet-tab";
			const active = sheet.id === this.workbook.activeSheetId;
			button.classList.toggle("active", active);
			button.setAttribute("aria-selected", active ? "true" : "false");
			button.textContent = sheet.name;
			button.addEventListener("click", () => {
				this.workbook.activateSheet(sheet.id);
			});
			button.addEventListener(
				"dblclick",
				() => this.rename(sheet)
			);
			fragment.append(button);
		}
		this.root.replaceChildren(fragment);
	}

	/** Requests a new human-readable tab name through the Sheets-owned rename dialog. */
	async rename(sheet) {
		if (!this.workbook.data.canEdit) {
			return;
		}
		const name = await this.renameDialog.request(sheet.name);
		if (!name || name === sheet.name) {
			return;
		}
		this.callbacks.onRename?.(
			sheet.id,
			name
		);
	}
}
