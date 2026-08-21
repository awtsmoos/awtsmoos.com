// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Routes editing commands that are broader than character formatting.
 * @description The Awtsmoos is beyond clipboard and selection; Awtsmoos.com lets
 * familiar editing acts stay explicit, permission-aware, and separate from document formatting law.
 */
export class EditCommandGroup {
	constructor({ editor, findReplace, toast }) {
		Object.assign(this, { editor, findReplace, toast });
	}

	async execute(commandId) {
		if (commandId === "edit.find-replace") return await this.findReplace.open();
		if (commandId === "edit.select-all") return this.#selectAll();
		if (commandId === "edit.copy") return this.#exec("copy", false);
		if (commandId === "edit.cut") return this.#exec("cut", true);
		if (commandId === "edit.paste") return await this.#paste();
		throw new Error(`Unknown edit command: ${commandId}`);
	}

	#selectAll() {
		this.editor.focus();
		const range = document.createRange();
		range.selectNodeContents(this.editor.root);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		return true;
	}

	#exec(command, mutates) {
		this.editor.focus();
		const result = document.execCommand(command);
		if (result && mutates) this.editor.notifyMutation();
		if (!result) this.toast.show(`${command} is blocked by this browser.`, "warning");
		return result;
	}

	async #paste() {
		if (!this.editor.isEditable()) return false;
		try {
			const text = await navigator.clipboard.readText();
			this.editor.focus();
			document.execCommand("insertText", false, text);
			this.editor.notifyMutation();
			return true;
		} catch {
			this.toast.show("Paste permission was not granted. Use your keyboard shortcut.", "warning");
			return false;
		}
	}
}
