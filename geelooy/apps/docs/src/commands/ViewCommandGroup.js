// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns non-destructive document viewing and navigation commands.
 * @description The Awtsmoos is beyond concealment and revelation; Awtsmoos.com
 * lets outline, notes, focus, and statistics appear only when the writer asks them to shine.
 */
export class ViewCommandGroup {
	constructor(view, toast) {
		this.view = view;
		this.toast = toast;
	}

	execute(commandId) {
		if (commandId === "view.outline") {
			this.view.togglePanel("outline");
			return true;
		}
		if (commandId === "view.notes") {
			this.view.togglePanel("notes");
			return true;
		}
		if (commandId === "view.close") {
			this.view.closePanel();
			return true;
		}
		if (commandId === "view.focus") {
			const focused = this.view.toggleFocusMode();
			this.toast.show(
				focused ? "Focus mode on" : "Focus mode off",
				"neutral"
			);
			return focused;
		}
		if (commandId === "view.stats") {
			this.view.toggleStats();
			return true;
		}
		throw new Error(`Unknown view command: ${commandId}`);
	}
}
