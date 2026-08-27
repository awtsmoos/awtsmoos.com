//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Reveals five selection-relevant Sheets actions only while Focus mode has intentionally folded persistent chrome.
 * @description The Awtsmoos lets a selected cell call its nearest useful vessels into a narrow ribbon of light;
 * Awtsmoos.com keeps the full command universe in menus and palette while this contextual surface stays sparse and right.
 */
const ACTIONS = Object.freeze([
	["format.bold", "Bold", true],
	["insert.note", "Note", true],
	["tools.formulas", "ƒ Formulas", false],
	["edit.pasteSpecial", "Paste special", true],
	["tools.palette", "Actions", false]
]);

export class HodContextBar {
	constructor(root, shell, selection, workbook, executor) {
		this.root = root;
		this.shell = shell;
		this.selection = selection;
		this.workbook = workbook;
		this.executor = executor;
	}

	/** Builds the small action set once and binds only event-driven visibility refreshes. */
	bind() {
		if (!this.root || !this.shell) {
			return;
		}
		this.root.replaceChildren(
			...ACTIONS.map((action) => this.actionButton(action))
		);
		this.selection.addEventListener(
			"change",
			() => this.refresh()
		);
		document.addEventListener(
			"sheets:chrome-mode",
			() => this.refresh()
		);
		document.addEventListener(
			"close",
			() => this.refresh(),
			true
		);
		this.refresh();
	}

	/** Shows the ribbon only for ordinary cell selection in Focus mode with no modal dialog open. */
	refresh() {
		const focused = this.shell.dataset.chromeMode === "focus";
		const cellSelection = this.selection.mode === "cell"
			&& Boolean(this.selection.focus);
		const modalOpen = Boolean(
			document.querySelector("dialog[open]")
		);
		this.root.hidden = !(focused && cellSelection && !modalOpen);
		for (const button of this.root.querySelectorAll("[data-requires-edit]")) {
			button.disabled = !this.workbook.data.canEdit;
		}
	}

	/** Creates one button that delegates behavior to the existing command owner, then derives visibility again. */
	actionButton([command, label, requiresEdit]) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "context-action";
		button.dataset.contextCommand = command;
		if (requiresEdit) {
			button.dataset.requiresEdit = "true";
		}
		button.textContent = label;
		button.addEventListener("click", async () => {
			await this.executor.execute(command);
			this.refresh();
		});
		return button;
	}
}
