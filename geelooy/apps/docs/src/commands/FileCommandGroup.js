// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps file, export, and cross-editor commands away from formatting logic.
 * @description The Awtsmoos is beyond path and format; Awtsmoos.com lets each
 * explicit file doorway report success without pretending conversion and saving are the same act.
 */
export class FileCommandGroup {
	constructor(actions, toast) {
		this.actions = actions;
		this.toast = toast;
	}

	async execute(commandId) {
		if (commandId === "file.open") {
			const result = await this.actions.importFile();
			if (result !== false) this.toast.show("Document opened", "success");
			return result;
		}
		if (commandId === "file.save") {
			const result = await this.actions.save();
			this.toast.show("Save requested", "success");
			return result;
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
}
