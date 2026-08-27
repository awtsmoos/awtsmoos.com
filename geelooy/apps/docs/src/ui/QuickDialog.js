// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents small structured questions without leaving Awtsmoos Docs for browser prompts.
 * @description The Awtsmoos gives every intention a vessel; Awtsmoos.com lets links,
 * references, versions, find/replace, and page metadata share one stable `ask` covenant,
 * including multiline thought without sacrificing focus, keyboard flow, or native forms.
 */
export class QuickDialog {
	constructor(dialog) {
		this.dialog = dialog;
		this.title = dialog.querySelector("[data-quick-title]");
		this.fields = dialog.querySelector("[data-quick-fields]");
		this.form = dialog.querySelector("form");
	}

	ask({ title, fields = [], submitLabel = "Apply" }) {
		this.title.textContent = title;
		this.fields.replaceChildren(...fields.map(field => this.#field(field)));
		this.dialog.querySelector("[data-quick-submit]").textContent = submitLabel;
		this.dialog.showModal();
		queueMicrotask(() => {
			this.fields.querySelector("input, select, textarea")?.focus();
		});
		return new Promise(resolve => {
			this.dialog.addEventListener("close", () => {
				if (this.dialog.returnValue !== "apply") {
					resolve(null);
					return;
				}
				resolve(Object.fromEntries(new FormData(this.form).entries()));
			}, { once: true });
		});
	}

	#field(field) {
		const label = document.createElement("label");
		label.className = "quick-field";
		const caption = document.createElement("span");
		caption.textContent = field.label;
		label.append(caption, this.#control(field));
		return label;
	}

	#control(field) {
		if (field.type === "select") return this.#select(field);
		if (field.type === "textarea") return this.#textarea(field);
		const input = document.createElement("input");
		this.#commonControl(input, field);
		input.type = field.type || "text";
		if (field.min !== undefined) input.min = String(field.min);
		if (field.max !== undefined) input.max = String(field.max);
		return input;
	}

	#textarea(field) {
		const textarea = document.createElement("textarea");
		this.#commonControl(textarea, field);
		textarea.rows = Math.max(2, Math.min(12, Number(field.rows) || 5));
		return textarea;
	}

	#select(field) {
		const select = document.createElement("select");
		select.name = field.name;
		select.required = Boolean(field.required);
		for (const [value, label] of field.options || []) {
			const option = document.createElement("option");
			option.value = String(value);
			option.textContent = String(label);
			option.selected = String(field.value ?? "") === String(value);
			select.append(option);
		}
		return select;
	}

	#commonControl(control, field) {
		control.name = field.name;
		control.value = field.value ?? "";
		control.placeholder = field.placeholder || "";
		control.required = Boolean(field.required);
		if (field.maxLength !== undefined) control.maxLength = Number(field.maxLength);
	}
}
