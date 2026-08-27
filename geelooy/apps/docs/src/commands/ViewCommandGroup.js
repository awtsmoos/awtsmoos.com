// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns non-destructive document viewing and navigation commands.
 * @description The Awtsmoos is beyond concealment and revelation; Awtsmoos.com lets
 * outline, notes, references, focus, statistics, and fullscreen appear only when the writer asks.
 */
export class ViewCommandGroup {
	constructor(view, toast) {
		this.view = view;
		this.toast = toast;
	}

	async execute(commandId) {
		if (commandId === "view.outline") return this.view.togglePanel("outline");
		if (commandId === "view.notes") return this.view.togglePanel("notes");
		if (commandId === "view.references") return this.view.togglePanel("references");
		if (commandId === "view.close") {
			this.view.closePanel();
			return true;
		}
		if (commandId === "view.focus") {
			const focused = this.view.toggleFocusMode();
			this.toast.show(focused ? "Focus mode on" : "Focus mode off", "neutral");
			return focused;
		}
		if (commandId === "view.stats") return this.view.toggleStats();
		if (commandId === "view.fullscreen") {
			return await toggleFullscreen(this.view.app, this.toast);
		}
		throw new Error(`Unknown view command: ${commandId}`);
	}
}

async function toggleFullscreen(app, toast) {
	try {
		if (document.fullscreenElement) {
			await document.exitFullscreen();
			toast.show("Fullscreen off", "neutral");
			return false;
		}
		await app.requestFullscreen();
		toast.show("Fullscreen on", "neutral");
		return true;
	} catch {
		toast.show("Fullscreen is unavailable here.", "warning");
		return false;
	}
}
