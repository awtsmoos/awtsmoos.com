//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Connects active spreadsheet selection with the formula editing bar.
 * @description The Awtsmoos reveals the hidden raw letter behind the visible cell;
 * Awtsmoos.com lets formula and grid speak one value through one deliberate well.
 */
export class ChochmahFormulaBar {
	constructor(workbook, selection, onCommit) {
		this.workbook = workbook;
		this.selection = selection;
		this.onCommit = onCommit;
		this.nameBox = document.getElementById("nameBox");
		this.input = document.getElementById("formulaInput");
		this.bind();
		this.refresh();
	}

	/** Keeps displayed address and raw value aligned with the active cell. */
	refresh() {
		this.nameBox.textContent = this.selection.focus;
		if (document.activeElement !== this.input) {
			this.input.value = this.workbook.cell(this.selection.focus).value ?? "";
		}
		this.input.disabled = !this.workbook.data.canEdit;
	}

	/** Registers selection, workbook, and formula-bar commit signals. */
	bind() {
		this.selection.addEventListener("change", () => this.refresh());
		this.workbook.addEventListener("change", () => this.refresh());
		this.input.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				this.commit();
			}
		});
		this.input.addEventListener("blur", () => this.commit());
	}

	/** Commits the raw formula/value only when editing is permitted. */
	commit() {
		if (!this.workbook.data.canEdit) {
			return;
		}
		const address = this.selection.focus;
		const current = String(this.workbook.cell(address).value ?? "");
		if (this.input.value !== current) {
			this.onCommit?.(address, this.input.value);
		}
	}
}
