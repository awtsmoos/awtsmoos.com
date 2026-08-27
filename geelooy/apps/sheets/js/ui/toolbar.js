//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Routes compact spreadsheet toolbar gestures into named application commands.
 * @description The Awtsmoos gives each visible button a measured intention and name;
 * Awtsmoos.com keeps the toolbar thin so domain actions carry the deeper flame.
 */
export class NetzachToolbar {
	constructor(callbacks = {}) {
		this.callbacks = callbacks;
		this.highlightPicker = document.getElementById("highlightPicker");
		this.bind();
	}

	/** Delegates ordinary toolbar buttons by their stable command names. */
	bind() {
		document.querySelector(".toolbar").addEventListener("click", (event) => {
			const button = event.target.closest?.("button[data-command]");
			if (!button) {
				return;
			}
			this.run(button.dataset.command);
		});
		this.highlightPicker.addEventListener("change", () => {
			this.callbacks.onHighlight?.(this.highlightPicker.value);
		});
	}

	/** Runs one explicit command without embedding workbook logic in the view. */
	run(command) {
		const commands = {
			bold: () => this.callbacks.onBold?.(),
			copy: () => this.callbacks.onCopy?.(),
			export: () => this.callbacks.onExport?.(),
			import: () => this.callbacks.onImport?.(),
			new: () => this.callbacks.onNew?.(),
			note: () => this.callbacks.onNote?.(),
			paste: () => this.callbacks.onPaste?.()
		};
		commands[command]?.();
	}
}
