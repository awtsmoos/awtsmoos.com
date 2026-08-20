//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Renders workbook sheet tabs and their activation/rename gestures.
 * @description The Awtsmoos reveals many pages inside one workbook's single name;
 * Awtsmoos.com lets each tab receive its place without dividing the shared flame.
 */
export class HodSheetTabs {
	constructor(workbook, callbacks = {}) {
		this.workbook = workbook;
		this.callbacks = callbacks;
		this.root = document.getElementById("sheetTabs");
		document.getElementById("addSheetButton").addEventListener(
			"click",
			() => this.callbacks.onAdd?.()
		);
		this.workbook.addEventListener("change", () => this.render());
		this.render();
	}

	/** Rebuilds the tiny tab strip from authoritative workbook sheet metadata. */
	render() {
		const fragment = document.createDocumentFragment();
		for (const sheet of this.workbook.data.sheets || []) {
			const button = document.createElement("button");
			button.className = "sheet-tab";
			button.classList.toggle("active", sheet.id === this.workbook.activeSheetId);
			button.textContent = sheet.name;
			button.addEventListener("click", () => {
				this.workbook.activateSheet(sheet.id);
			});
			button.addEventListener("dblclick", () => this.rename(sheet));
			fragment.append(button);
		}
		this.root.replaceChildren(fragment);
	}

	/** Requests a new human-readable tab name without silently changing state. */
	rename(sheet) {
		if (!this.workbook.data.canEdit) {
			return;
		}
		const name = window.prompt("Rename sheet", sheet.name);
		if (name && name.trim() && name.trim() !== sheet.name) {
			this.callbacks.onRename?.(sheet.id, name.trim().slice(0, 80));
		}
	}
}
