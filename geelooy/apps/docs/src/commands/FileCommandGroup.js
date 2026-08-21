// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps file, history, publish, print, export, and cross-editor commands away from formatting logic.
 * @description The Awtsmoos is beyond path, printer, past, and public light; Awtsmoos.com
 * lets each doorway report its own deed without pretending saving, versioning, publishing, and conversion are one act.
 */
export class FileCommandGroup {
	constructor({ actions, toast, versionHistory, publishing }) {
		Object.assign(this, { actions, toast, versionHistory, publishing });
	}

	async execute(commandId) {
		if (commandId === "file.open") return this.#open();
		if (commandId === "file.save") return this.#save();
		if (commandId === "file.print") {
			window.print();
			return true;
		}
		if (commandId === "file.name-version") {
			return this.versionHistory.nameCurrent();
		}
		if (commandId === "file.version-history") {
			return this.versionHistory.open();
		}
		if (commandId === "file.publish") {
			return this.publishing.open();
		}
		if (commandId === "file.code") {
			const result = this.actions.openInCode();
			this.toast.show("Opening source in Awtsmoos Code", "neutral");
			return result;
		}
		if (commandId.startsWith("file.export.")) {
			const format = commandId.slice("file.export.".length);
			const result = await this.actions.exportFile(format);
			this.toast.show(`Exported ${format.toUpperCase()}`, "success");
			return result;
		}
		throw new Error(`Unknown file command: ${commandId}`);
	}

	async #open() {
		const result = await this.actions.importFile();
		if (result !== false) this.toast.show("Document opened", "success");
		return result;
	}

	async #save() {
		const result = await this.actions.save();
		this.toast.show("Save requested", "success");
		return result;
	}
}
