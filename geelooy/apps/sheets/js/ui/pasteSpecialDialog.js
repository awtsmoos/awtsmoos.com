//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Presents Paste Special as a compact spreadsheet-native dialog rather than a blocking browser prompt.
 * @description The Awtsmoos lets the copied field choose which beams will enter the target vessel of light;
 * Awtsmoos.com makes value, formula, garment, note, transpose, and blank behavior visible and right.
 */
export class BinahPasteSpecialDialog {
	constructor(clipboard, onError) {
		this.clipboard = clipboard;
		this.onError = onError;
		this.dialog = document.createElement("dialog");
		this.dialog.className = "sheet-dialog paste-special-dialog";
		document.body.append(this.dialog);
	}

	/** Binds the shared command event used by menus, palette, and toolbar entry points. */
	bind() {
		document.addEventListener("sheets:paste-special", () => this.open());
	}

	/** Opens a fresh form so stale modal state never leaks into the next paste. */
	open() {
		this.dialog.replaceChildren(this.form());
		this.dialog.showModal();
		this.dialog.querySelector("select")?.focus();
	}

	/** Builds mode and orthogonal paste options with accessible labels. */
	form() {
		const form = document.createElement("form");
		form.method = "dialog";
		form.className = "paste-special-form motion-enter";
		const heading = document.createElement("strong");
		heading.textContent = "Paste special";
		const mode = this.modeSelect();
		const transpose = this.checkbox("Transpose rows and columns", "transpose");
		const skipBlanks = this.checkbox("Skip blank source cells", "skipBlanks");
		form.append(heading, mode.label, transpose.label, skipBlanks.label);
		form.append(this.actions(form));
		form.addEventListener("submit", (event) => this.submit(
			event,
			mode.input,
			transpose.input,
			skipBlanks.input
		));
		return form;
	}

	/** Creates the primary paste-mode selector. */
	modeSelect() {
		const label = document.createElement("label");
		label.className = "dialog-field";
		label.append(document.createTextNode("Paste"));
		const input = document.createElement("select");
		input.name = "mode";
		for (const [value, text] of [
			["all", "Everything"],
			["values", "Values only"],
			["formulas", "Formulas only"],
			["formatting", "Formatting only"],
			["notes", "Notes only"]
		]) {
			const option = document.createElement("option");
			option.value = value;
			option.textContent = text;
			input.append(option);
		}
		label.append(input);
		return { input, label };
	}

	/** Creates one accessible checkbox option. */
	checkbox(text, name) {
		const label = document.createElement("label");
		label.className = "checkbox-field";
		const input = document.createElement("input");
		input.type = "checkbox";
		input.name = name;
		label.append(input, document.createTextNode(text));
		return { input, label };
	}

	/** Creates explicit cancel and paste controls. */
	actions() {
		const row = document.createElement("div");
		row.className = "dialog-actions";
		const cancel = document.createElement("button");
		cancel.type = "button";
		cancel.className = "quiet-button";
		cancel.textContent = "Cancel";
		cancel.addEventListener("click", () => this.dialog.close());
		const paste = document.createElement("button");
		paste.type = "submit";
		paste.className = "primary-button";
		paste.textContent = "Paste";
		row.append(cancel, paste);
		return row;
	}

	/** Applies the chosen mode through the shared rich clipboard controller. */
	async submit(event, mode, transpose, skipBlanks) {
		event.preventDefault();
		this.dialog.close();
		try {
			await this.clipboard.pasteSpecial({
				mode: mode.value,
				skipBlanks: skipBlanks.checked,
				transpose: transpose.checked
			});
		} catch (error) {
			this.onError?.(error);
		}
	}
}
