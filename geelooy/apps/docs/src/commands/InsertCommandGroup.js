// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Executes insertion commands through accessible Awtsmoos Docs dialogs.
 * @description The Awtsmoos renews selection and intention beyond every modal pause;
 * Awtsmoos.com remembers the range, asks clearly, then returns the new vessel to its place.
 */
export class InsertCommandGroup {
	constructor({ insertion, mutations, quickDialog, bookmark }) {
		this.insertion = insertion;
		this.mutations = mutations;
		this.quickDialog = quickDialog;
		this.bookmark = bookmark;
	}

	async execute(commandId) {
		if (commandId === "insert.divider") return this.insertion.divider();
		if (commandId === "insert.link") return await this.#link();
		if (commandId === "insert.mention") return await this.#mention();
		if (commandId === "insert.table") return await this.#table();
		if (commandId === "insert.note") return await this.#note();
		throw new Error(`Unknown insertion command: ${commandId}`);
	}

	async #link() {
		const values = await this.#ask("Add link", [
			{ name: "url", label: "URL", placeholder: "https://…", required: true }
		]);
		return values ? this.insertion.link(values.url) : false;
	}

	async #mention() {
		const values = await this.#ask("Mention someone", [
			{ name: "alias", label: "Alias", placeholder: "name", required: true }
		]);
		return values ? this.insertion.mention(values.alias) : false;
	}

	async #table() {
		const values = await this.#ask("Insert table", [
			{ name: "rows", label: "Rows", type: "number", value: 3, min: 1, max: 12 },
			{ name: "columns", label: "Columns", type: "number", value: 3, min: 1, max: 12 }
		]);
		return values ? this.insertion.table(values.rows, values.columns) : false;
	}

	async #note() {
		const values = await this.#ask("Add note", [
			{ name: "text", label: "Note", placeholder: "What should collaborators know?", required: true }
		], "Add note");
		return values ? this.mutations.addComment(values.text) : false;
	}

	async #ask(title, fields, submitLabel = "Apply") {
		this.bookmark.capture();
		const values = await this.quickDialog.ask({ title, fields, submitLabel });
		this.bookmark.restore();
		return values;
	}
}
