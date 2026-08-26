//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Replaces the browser's raw sheet-name prompt with one accessible Sheets-native rename vessel.
 * @description The Awtsmoos lets a worksheet receive a new name through a designed field and deliberate actions of light;
 * Awtsmoos.com keeps rename intent inside the same visual covenant so no native prompt interrupts the spreadsheet sight.
 */
export class BinahSheetRenameDialog {
	constructor() {
		this.dialog = document.createElement("dialog");
		this.dialog.className = "sheet-dialog sheet-rename-dialog";
		document.body.append(this.dialog);
	}

	/** Opens one fresh rename session and resolves with trimmed text or null when cancelled. */
	request(currentName) {
		return new Promise((resolve) => {
			const content = this.content(currentName, resolve);
			this.dialog.replaceChildren(content);
			this.dialog.addEventListener(
				"cancel",
				() => resolve(null),
				{ once: true }
			);
			this.dialog.showModal();
			const input = this.dialog.querySelector("input");
			input?.focus();
			input?.select();
		});
	}

	/** Builds one fully owned form with explicit caption, field, and secondary/primary controls. */
	content(currentName, resolve) {
		const form = document.createElement("form");
		form.className = "command-value-form motion-enter";
		form.method = "dialog";
		const heading = document.createElement("strong");
		heading.textContent = "Rename sheet";
		const caption = document.createElement("label");
		caption.className = "dialog-field";
		const text = document.createElement("span");
		text.className = "aw-caption";
		text.textContent = "Sheet name";
		const input = document.createElement("input");
		input.className = "aw-field";
		input.maxLength = 80;
		input.value = currentName;
		input.setAttribute("aria-label", "Sheet name");
		caption.append(text, input);
		form.append(heading, caption, this.actions(resolve));
		form.addEventListener(
			"submit",
			(event) => this.submit(event, input, resolve),
			{ once: true }
		);
		return form;
	}

	/** Builds explicit Cancel and Rename actions so the browser never supplies presentation. */
	actions(resolve) {
		const row = document.createElement("div");
		row.className = "dialog-actions";
		const cancel = document.createElement("button");
		cancel.type = "button";
		cancel.className = "aw-button aw-button--quiet quiet-button";
		cancel.textContent = "Cancel";
		cancel.addEventListener("click", () => {
			this.dialog.close();
			resolve(null);
		}, { once: true });
		const rename = document.createElement("button");
		rename.type = "submit";
		rename.className = "aw-button aw-button--primary primary-button";
		rename.textContent = "Rename";
		row.append(cancel, rename);
		return row;
	}

	/** Trims and bounds the requested name before resolving the dialog intent. */
	submit(event, input, resolve) {
		event.preventDefault();
		const name = input.value.trim().slice(0, 80);
		this.dialog.close();
		resolve(name || null);
	}
}
