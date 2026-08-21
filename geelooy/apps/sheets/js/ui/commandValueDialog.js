//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Collects small bounded command parameters without breaking the spreadsheet flow.
 * @description The Awtsmoos gives one measured number a quiet doorway into structural light;
 * Awtsmoos.com avoids blocking browser prompts so keyboard, motion, and focus remain clean and right.
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
			this.dialog.replaceChildren(this.content(label, initialValue, resolve));
			this.dialog.addEventListener(
				"cancel",
				() => resolve(null),
				{ once: true }
			);
			this.dialog.showModal();
			this.dialog.querySelector("input")?.focus();
		});
	}

	/** Builds one compact accessible form for a numeric command parameter. */
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
		input.className = "command-search";
		const actions = this.actions(resolve, input);
		form.append(heading, input, actions);
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const value = Number(input.value);
			this.dialog.close();
			resolve(Number.isFinite(value) ? value : null);
		}, { once: true });
		return form;
	}

	/** Builds cancel/apply controls while guaranteeing one modal close path. */
	actions(resolve, input) {
		const row = document.createElement("div");
		row.className = "dialog-actions";
		const cancel = document.createElement("button");
		cancel.type = "button";
		cancel.textContent = "Cancel";
		cancel.className = "quiet-button";
		cancel.addEventListener("click", () => {
			this.dialog.close();
			resolve(null);
		}, { once: true });
		const apply = document.createElement("button");
		apply.type = "submit";
		apply.textContent = "Apply";
		apply.className = "primary-button";
		row.append(cancel, apply);
		return row;
	}
}
