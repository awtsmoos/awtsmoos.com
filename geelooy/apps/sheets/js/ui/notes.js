//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Gives the active cell a separate collaborative note vessel.
 * @description The Awtsmoos lets hidden context accompany visible value without confusion;
 * Awtsmoos.com keeps commentary beside the cell, a second layer of shared illumination.
 */
export class BinahNotesPanel {
	constructor(workbook, selection, onSave) {
		this.workbook = workbook;
		this.selection = selection;
		this.onSave = onSave;
		this.panel = document.getElementById("notesPanel");
		this.address = document.getElementById("noteAddress");
		this.input = document.getElementById("noteInput");
		this.bind();
	}

	/** Opens the panel for the active cell and reveals its current note. */
	open() {
		this.address.textContent = this.selection.focus;
		this.input.value = this.workbook.cell(this.selection.focus).note || "";
		this.input.disabled = !this.workbook.data.canEdit;
		this.panel.hidden = false;
		if (this.workbook.data.canEdit) {
			this.input.focus();
		}
	}

	/** Closes the note vessel without mutating workbook state. */
	close() {
		this.panel.hidden = true;
	}

	/** Registers close, save, and selection-refresh behavior. */
	bind() {
		document.getElementById("closeNotes").addEventListener("click", () => this.close());
		document.getElementById("saveNote").addEventListener("click", () => this.save());
		this.selection.addEventListener("change", () => {
			if (!this.panel.hidden) {
				this.open();
			}
		});
	}

	/** Sends one bounded note change through the application callback. */
	save() {
		if (!this.workbook.data.canEdit) {
			return;
		}
		this.onSave?.(this.selection.focus, this.input.value.slice(0, 4000));
	}
}
