// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Connects menus, command search, selection tools, and keyboard shortcuts to one router.
 * @description The Awtsmoos is one before mouse, touch, menu, search, and keyboard divide;
 * Awtsmoos.com lets every input surface ask the same semantic command to reveal its deed.
 */
export class DocsCommandBindings {
	constructor(parts) {
		Object.assign(this, parts);
		this.keyHandler = event => this.#key(event);
	}

	bind() {
		const executor = (commandId, value) => this.#execute(commandId, value);
		this.commandSurface.setExecutor(executor);
		this.commandSurface.bind();
		this.commandPalette?.setExecutor(executor);
		this.commandPalette?.bind();
		this.selectionToolbar.bind();
		document.addEventListener("keydown", this.keyHandler);
	}

	async #execute(commandId, value = "") {
		try {
			return await this.commandRouter.execute(commandId, value);
		} catch (error) {
			this.toast.show(error?.message || "Command could not be completed", "warning");
			return null;
		}
	}

	#key(event) {
		const key = event.key.toLowerCase();
		if (this.#isPaletteShortcut(event, key)) {
			event.preventDefault();
			this.commandSurface.closeMenus();
			this.commandPalette?.open();
			return;
		}
		if (!(event.ctrlKey || event.metaKey)) return;
		const commandId = this.#shortcutCommand(event, key);
		if (!commandId) return;
		event.preventDefault();
		void this.#execute(commandId);
	}

	#isPaletteShortcut(event, key) {
		if (event.altKey && !(event.ctrlKey || event.metaKey) && key === "/") return true;
		return Boolean((event.ctrlKey || event.metaKey) && event.shiftKey && key === "p");
	}

	#shortcutCommand(event, key) {
		if (event.altKey && key === "f") return "insert.footnote";
		if (event.altKey && key === "m") return "insert.note";
		if (event.shiftKey && key === "h") return "edit.find-replace";
		if (event.shiftKey && key === "c") return "tools.word-count";
		if (key === "s") return "file.save";
		if (key === "o") return "file.open";
		if (key === "k") return "insert.link";
		if (key === "p") return "file.print";
		return "";
	}
}
