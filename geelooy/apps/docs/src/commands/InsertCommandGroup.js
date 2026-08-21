// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Executes insertion commands through accessible Awtsmoos Docs dialogs.
 * @description The Awtsmoos renews selection beyond every modal pause; Awtsmoos.com
 * delegates durable references to their own controller while this group keeps links,
 * navigation, structure, mentions, tables, and collaboration flowing through one menu tongue.
 */
export class InsertCommandGroup {
	constructor({ insertion, mutations, references, quickDialog, bookmark }) {
		this.insertion = insertion;
		this.mutations = mutations;
		this.references = references;
		this.quickDialog = quickDialog;
		this.bookmark = bookmark;
	}

	async execute(commandId) {
		if (commandId === "insert.footnote") return this.references.insert("footnote");
		if (commandId === "insert.endnote") return this.references.insert("endnote");
		if (commandId === "insert.divider") return this.insertion.divider();
		if (commandId === "insert.link") return this.#link();
		if (commandId === "insert.internal-link") return this.#internalLink();
		if (commandId === "insert.bookmark") return this.#bookmark();
		if (commandId === "insert.toc") return this.#toc();
		if (commandId === "insert.toc-refresh") return this.insertion.refreshTableOfContents();
		if (commandId === "insert.mention") return this.#mention();
		if (commandId === "insert.table") return this.#table();
		if (commandId === "insert.note") return this.#note();
		throw new Error(`Unknown insertion command: ${commandId}`);
	}

	async #link() {
		const values = await this.#ask("Add link", [
			{ name: "url", label: "URL", placeholder: "https://…", required: true }
		]);
		return values ? this.insertion.link(values.url) : false;
	}

	async #internalLink() {
		const options = this.insertion.navigationOptions();
		if (!options.length) return false;
		const values = await this.#ask("Link inside document", [
			{ name: "target", label: "Target", type: "select", options, required: true },
			{ name: "label", label: "Link text (optional)", placeholder: "Uses selected text when blank" }
		]);
		return values ? this.insertion.link(values.target, values.label) : false;
	}

	async #bookmark() {
		const values = await this.#ask("Add bookmark", [
			{ name: "name", label: "Bookmark name", placeholder: "Key decision", required: true }
		]);
		return values ? this.insertion.bookmark(values.name) : false;
	}

	async #toc() {
		const options = [1, 2, 3, 4, 5, 6].map(level => [level, `Heading ${level} and above`]);
		const values = await this.#ask("Insert table of contents", [
			{ name: "depth", label: "Deepest heading level", type: "select", value: 3, options }
		], "Insert");
		return values ? this.insertion.tableOfContents(values.depth) : false;
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
