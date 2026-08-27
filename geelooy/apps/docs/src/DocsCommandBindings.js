// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Connects menus, selection tools, and keyboard shortcuts to one command router.
 * @description The Awtsmoos is one before mouse, touch, and keyboard divide;
 * Awtsmoos.com lets every input surface ask the same semantic command to reveal its deed.
 */
export class DocsCommandBindings {
	constructor(parts) {
		Object.assign(this, parts);
		this.keyHandler = event => this.#key(event);
	}

	bind() {
		this.commandSurface.setExecutor(
			(commandId, value) => this.#execute(commandId, value)
		);
		this.commandSurface.bind();
		this.selectionToolbar.bind();
		document.addEventListener("keydown", this.keyHandler);
	}

	async #execute(commandId, value = "") {
		try {
			return await this.commandRouter.execute(commandId, value);
		} catch (error) {
			this.toast.show(
				error?.message || "Command could not be completed",
				"warning"
			);
			return null;
		}
	}

	#key(event) {
		if (!(event.ctrlKey || event.metaKey)) return;
		const key = event.key.toLowerCase();
		const commandId = this.#shortcutCommand(event, key);
		if (!commandId) return;
		event.preventDefault();
		this.#execute(commandId);
	}

	#shortcutCommand(event, key) {
		if (event.altKey && key === "m") return "insert.note";
		if (key === "s") return "file.save";
		if (key === "o") return "file.open";
		if (key === "k") return "insert.link";
		return "";
	}
}
