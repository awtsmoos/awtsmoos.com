// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Connects direct document gestures that are not semantic menu commands.
 * @description The Awtsmoos renews title, focus, and dropped file alike; Awtsmoos.com
 * sends each gesture to one explicitly named mutation so view identity can never
 * masquerade as behavior merely because two finite concepts share the same noun.
 */
export class DocsUiBindings {
	constructor(parts) {
		this.view = parts.view;
		this.mutations = parts.mutations;
		this.collaboration = parts.collaboration;
		this.model = parts.model;
		this.actions = parts.actions;
	}

	/** Binds title, sharing, presence focus, and file-drop gestures exactly once. */
	bind() {
		this.view.title.addEventListener(
			"input",
			() => this.mutations.titleInput()
		);
		this.view.title.addEventListener(
			"change",
			() => this.collaboration.title(this.model.title)
		);
		this.view.shareButton.addEventListener(
			"click",
			() => this.actions.openShare()
		);
		this.view.canvas.addEventListener(
			"focusin",
			event => this.mutations.focusPresence(event)
		);
		this.#bindDropImport();
	}

	/** Keeps file drag affordance and import authority limited to an actual dropped File. */
	#bindDropImport() {
		this.view.canvas.addEventListener("dragover", event => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			this.view.app.classList.add("is-file-dragging");
		});
		this.view.canvas.addEventListener("dragleave", () => {
			this.view.app.classList.remove("is-file-dragging");
		});
		this.view.canvas.addEventListener("drop", event => {
			this.view.app.classList.remove("is-file-dragging");
			if (!hasFiles(event)) return;
			event.preventDefault();
			const file = event.dataTransfer.files?.[0];
			if (file) this.actions.importDropped(file);
		});
	}
}

/** Returns true only for drag payloads that actually advertise native files. */
function hasFiles(event) {
	return Array.from(event.dataTransfer?.types || []).includes("Files");
}
