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
		if (commandId === "insert.table-row-above") return this.insertion.tableRow("above");
		if (commandId === "insert.table-row-below") return this.insertion.tableRow("below");
		if (commandId === "insert.table-row-delete") return this.insertion.tableRow("delete");
		if (commandId === "insert.table-column-left") return this.insertion.tableColumn("left");
		if (commandId === "insert.table-column-right") return this.insertion.tableColumn("right");
		if (commandId === "insert.table-column-delete") return this.insertion.tableColumn("delete");
		if (commandId === "insert.page-break") return this.insertion.pageBreak();
		if (commandId === "insert.image") return this.#image();
		if (commandId === "insert.symbol") return this.#symbol();
		if (commandId === "insert.note") return this.#note();
		throw new Error(`Unknown insertion command: ${commandId}`);
	}

	async #link() {
		const values = await this.#ask("Add link", [
			{ name: "url", label: "URL", placeholder: "https://…", required: true },
			{ name: "label", label: "Display text (optional)", placeholder: "Uses selected text when blank" }
		]);
		return values ? this.insertion.link(values.url, values.label) : false;
	}

	async #symbol() {
		const values = await this.#ask("Insert special character", [
			{
				name: "symbol", label: "Character", type: "select", required: true,
				options: [
					["—", "— Em dash"], ["–", "– En dash"], ["…", "… Ellipsis"],
					["©", "© Copyright"], ["®", "® Registered"], ["™", "™ Trademark"],
					["•", "• Bullet"], ["·", "· Middle dot"], ["§", "§ Section"],
					["¶", "¶ Pilcrow"], ["†", "† Dagger"], ["‡", "‡ Double dagger"],
					["←", "← Left arrow"], ["→", "→ Right arrow"],
					["↑", "↑ Up arrow"], ["↓", "↓ Down arrow"],
					["★", "★ Star"], ["✓", "✓ Check"], ["✗", "✗ Cross"],
					["א", "א Alef"], ["ב", "ב Bet"], ["ש", "ש Shin"],
					["“", "“ Open quote"], ["”", "” Close quote"],
					["‘", "‘ Open single quote"], ["’", "’ Close single quote"]
				]
			}
		], "Insert");
		return values ? this.insertion.symbol(values.symbol) : false;
	}

	async #image() {
		const dataUrl = await pickImageDataUrl();
		return dataUrl ? this.insertion.image(dataUrl) : false;
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

/** Opens a file chooser and reads one bounded image as a data URL. */
function pickImageDataUrl() {
	return new Promise(resolve => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/png,image/jpeg,image/gif,image/webp";
		input.addEventListener("change", () => {
			const file = input.files?.[0];
			if (!file || file.size > 250000) return resolve("");
			const reader = new FileReader();
			reader.addEventListener("load", () => resolve(String(reader.result || "")));
			reader.addEventListener("error", () => resolve(""));
			reader.readAsDataURL(file);
		});
		input.addEventListener("cancel", () => resolve(""));
		input.click();
	});
}
