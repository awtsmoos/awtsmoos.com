// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reflects document editing authority into toolbar controls.
 * @description The Awtsmoos is beyond enabled and disabled states; Awtsmoos.com
 * gives each editing control the honest state of the permission vessel it currently inhabits.
 */
export class Toolbar {
	constructor(root) {
		this.root = root;
		this.bound = false;
		this.selectionHandler = () => this.refreshFormatAvailability();
	}

	bind() {
		this.refreshDisabledState();
		if (this.bound) return;
		this.bound = true;
		document.addEventListener("selectionchange", this.selectionHandler);
	}

	setEditable(editable) {
		this.root.dataset.editable = String(Boolean(editable));
		this.refreshDisabledState();
	}

	refreshDisabledState() {
		const editable = this.root.dataset.editable !== "false";
		for (const control of this.root.querySelectorAll("[data-requires-edit]")) {
			control.disabled = !editable;
			control.setAttribute("aria-disabled", String(!editable));
		}
		this.refreshFormatAvailability();
	}

	/**
	 * Greys the nine format buttons until the writer has a live spot in the
	 * document. With no selection in the canvas, Bold/Italic/lists/Undo/Redo
	 * act on nothing visible; a visibly disabled button with an honest title
	 * says so instead of sitting silently dead. A collapsed caret inside the
	 * document still counts: toggling the typing style and converting the
	 * caret's block are real work.
	 */
	refreshFormatAvailability() {
		const editable = this.root.dataset.editable !== "false";
		const available = editable && hasEditorSelection();
		for (const control of this.root.querySelectorAll("button[data-doc-command]")) {
			const command = control.dataset.docCommand;
			if (!FORMAT_COMMANDS.has(command)) continue;
			control.disabled = !available;
			control.setAttribute("aria-disabled", String(!available));
			if (available) {
				if (control.dataset.formatTitle) control.title = control.dataset.formatTitle;
			} else {
				if (!control.dataset.formatTitle) {
					control.dataset.formatTitle = control.title || control.getAttribute("aria-label") || "";
				}
				control.title = FORMAT_UNAVAILABLE_TITLE[command]
					|| "Click in the document first, then select text to format it";
			}
		}
	}
}

/** The nine formatting-toolbar commands whose work needs a document selection. */
const FORMAT_COMMANDS = new Set([
	"format.undo",
	"format.redo",
	"format.bold",
	"format.italic",
	"format.underline",
	"format.strike",
	"format.bullets",
	"format.numbers",
	"format.checklist"
]);

const FORMAT_UNAVAILABLE_TITLE = {
	"format.undo": "Click in the document first — Undo acts on the document you are editing",
	"format.redo": "Click in the document first — Redo acts on the document you are editing"
};

/** Returns true when the live selection (even a collapsed caret) sits in the editor canvas. */
function hasEditorSelection() {
	const canvas = document.querySelector("#documentCanvas");
	if (!canvas) return false;
	const selection = getSelection();
	if (!selection?.rangeCount) return false;
	return canvas.contains(selection.getRangeAt(0).commonAncestorContainer);
}
