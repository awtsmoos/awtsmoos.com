// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Collects the visible Awtsmoos Docs vessels behind semantic names.
 * @description The Awtsmoos is beyond every selector and panel; Awtsmoos.com lets
 * orchestration speak in meanings like outline, notes, references, focus, and status,
 * while one side-panel switcher keeps those temporary workspaces mutually intelligible.
 */
export class DocsView {
	constructor(root = document) {
		this.app = root.querySelector("#docsApp");
		this.title = root.querySelector("#documentTitle");
		this.canvas = root.querySelector("#documentCanvas");
		this.menuBar = root.querySelector("#docsMenuBar");
		this.toolbar = root.querySelector("#formattingToolbar");
		this.presence = root.querySelector("#presence");
		this.shareButton = root.querySelector("#shareButton");
		this.shareDialog = root.querySelector("#shareDialog");
		this.quickDialog = root.querySelector("#quickDialog");
		this.commandRoot = this.app;
		this.selectionToolbar = root.querySelector("#selectionToolbar");
		this.sidePanel = root.querySelector("#sidePanel");
		this.outlineList = root.querySelector("#outlineList");
		this.commentsPanel = root.querySelector("#commentsPanel");
		this.referencesPanel = root.querySelector("#referencesPanel");
		this.outlineSection = root.querySelector("#outlineSection");
		this.notesSection = root.querySelector("#notesSection");
		this.referencesSection = root.querySelector("#referencesSection");
		this.documentStats = root.querySelector("#documentStats");
		this.toastRegion = root.querySelector("#toastRegion");
		this.liveStatus = root.querySelector("#liveStatus");
		this.driveStatus = root.querySelector("#driveStatus");
		this.activePanel = "";
	}

	setTitle(value) {
		if (document.activeElement !== this.title) {
			this.title.value = String(value || "Untitled document");
		}
	}

	setEditingEnabled(enabled) {
		this.title.disabled = !enabled;
		for (const control of document.querySelectorAll("[data-requires-edit]")) {
			control.disabled = !enabled;
		}
	}

	openPanel(mode) {
		this.activePanel = mode;
		this.sidePanel.hidden = false;
		this.sidePanel.dataset.panel = mode;
		for (const [name, section] of this.#sections()) {
			section.hidden = name !== mode;
		}
		this.#markPanelTabs(mode);
	}

	closePanel() {
		this.activePanel = "";
		this.sidePanel.hidden = true;
		this.#markPanelTabs("");
	}

	togglePanel(mode) {
		if (!this.sidePanel.hidden && this.activePanel === mode) {
			this.closePanel();
			return false;
		}
		this.openPanel(mode);
		return true;
	}

	toggleFocusMode() {
		const focused = !this.app.classList.contains("is-focus-mode");
		this.app.classList.toggle("is-focus-mode", focused);
		return focused;
	}

	toggleStats() {
		this.documentStats.hidden = !this.documentStats.hidden;
		return !this.documentStats.hidden;
	}

	#sections() {
		return [
			["outline", this.outlineSection],
			["notes", this.notesSection],
			["references", this.referencesSection]
		];
	}

	#markPanelTabs(mode) {
		for (const button of document.querySelectorAll("[data-panel-target]")) {
			button.classList.toggle("is-active", button.dataset.panelTarget === mode);
		}
	}
}
