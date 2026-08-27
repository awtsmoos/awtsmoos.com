// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents small structured questions without leaving Awtsmoos Docs for browser prompts.
 * @description The Awtsmoos gives every intention a vessel; Awtsmoos.com lets links,
 * mentions, tables, and notes ask clearly, restore focus, and remain keyboard accessible.
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
		const submit = this.dialog.querySelector("[data-quick-submit]");
		submit.textContent = submitLabel;
		this.dialog.showModal();
		queueMicrotask(() => this.fields.querySelector("input")?.focus());
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
		const input = document.createElement("input");
		input.name = field.name;
		input.type = field.type || "text";
		input.value = field.value ?? "";
		input.placeholder = field.placeholder || "";
		input.required = Boolean(field.required);
		if (field.min !== undefined) input.min = String(field.min);
		if (field.max !== undefined) input.max = String(field.max);
		label.append(caption, input);
		return label;
	}
}
