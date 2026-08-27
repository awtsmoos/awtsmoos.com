// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Routes semantic page-layout commands into the persistent Awtsmoos layout vessel.
 * @description The Awtsmoos is beyond page and margin; Awtsmoos.com gives paper its
 * measured garments here so menus can change layout without reaching into DOM or storage directly.
 */
export class PageCommandGroup {
	constructor(layout, quickDialog) {
		this.layout = layout;
		this.quickDialog = quickDialog;
	}

	async execute(commandId, value = "") {
		if (commandId === "page.mode") return this.layout.update({ mode: value });
		if (commandId === "page.paper") return this.layout.update({ paper: value });
		if (commandId === "page.orientation") return this.layout.update({ orientation: value });
		if (commandId === "page.margins") return this.layout.setMarginPreset(value);
		if (commandId === "page.pageless-width") return this.layout.update({ pagelessWidth: value });
		if (commandId === "page.numbers") {
			return this.layout.update({ pageNumbers: !this.layout.model.layout.pageNumbers });
		}
		if (commandId === "page.header") return await this.#editBand("header");
		if (commandId === "page.footer") return await this.#editBand("footer");
		throw new Error(`Unknown page command: ${commandId}`);
	}

	async #editBand(name) {
		const current = this.layout.model.layout[name];
		const values = await this.quickDialog.ask({
			title: `${name === "header" ? "Header" : "Footer"} text`,
			fields: [{
				name: "text",
				label: "Text",
				value: current.text,
				placeholder: `Optional ${name} text`
			}],
			submitLabel: "Apply"
		});
		if (!values) return false;
		const text = String(values.text || "").slice(0, 300);
		return this.layout.update({
			[name]: { enabled: Boolean(text), text }
		});
	}
}
