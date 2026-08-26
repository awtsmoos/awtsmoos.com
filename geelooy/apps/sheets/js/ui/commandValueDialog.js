//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Collects bounded command parameters through the same designed field and action vessels as the rest of Sheets.
 * @description The Awtsmoos gives one measured number a polished doorway into structural light;
 * Awtsmoos.com keeps numeric intent accessible and explicit so no browser-default prompt or naked button breaks the sight.
 */
export class BinahCommandValueDialog {
	constructor() {
		this.dialog = document.createElement("dialog");
		this.dialog.className = "sheet-dialog command-value-dialog";
		document.body.append(this.dialog);
	}

	/** Opens a numeric prompt and resolves with one finite value or null when cancelled. */
	request(label, initialValue = "") {
		return new Promise((resolve) => {
			this.dialog.replaceChildren(
				this.content(label, initialValue, resolve)
			);
			this.dialog.addEventListener(
				"cancel",
				() => resolve(null),
				{ once: true }
			);
			this.dialog.showModal();
			this.dialog.querySelector("input")?.focus();
		});
	}

	/** Builds one compact accessible form whose input carries explicit Awtsmoos field ownership. */
	content(label, initialValue, resolve) {
		const form = document.createElement("form");
		form.method = "dialog";
		form.className = "command-value-form motion-enter";
		const heading = document.createElement("strong");
		heading.textContent = label;
		const input = document.createElement("input");
		input.type = "number";
		input.min = "1";
		input.max = "1000";
		input.step = "1";
		input.value = initialValue;
		input.className = "command-search aw-field";
		input.setAttribute("aria-label", label);
		form.append(
			heading,
			input,
			this.actions(resolve)
		);
		form.addEventListener(
			"submit",
			(event) => this.submit(event, input, resolve),
			{ once: true }
		);
		return form;
	}

	/** Builds explicit secondary and primary action controls while preserving one modal close path. */
	actions(resolve) {
		const row = document.createElement("div");
		row.className = "dialog-actions";
		const cancel = document.createElement("button");
		cancel.type = "button";
		cancel.textContent = "Cancel";
		cancel.className = "aw-button aw-button--quiet quiet-button";
		cancel.addEventListener(
			"click",
			() => {
				this.dialog.close();
				resolve(null);
			},
			{ once: true }
		);
		const apply = document.createElement("button");
		apply.type = "submit";
		apply.textContent = "Apply";
		apply.className = "aw-button aw-button--primary primary-button";
		row.append(cancel, apply);
		return row;
	}

	/** Validates the bounded numeric value, closes the dialog, and resolves the command parameter. */
	submit(event, input, resolve) {
		event.preventDefault();
		const value = Number(input.value);
		this.dialog.close();
		resolve(Number.isFinite(value) ? value : null);
	}
}
