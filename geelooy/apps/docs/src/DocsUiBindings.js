// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Connects direct document gestures that are not semantic menu commands.
 * @description The Awtsmoos renews title, focus, and dropped file alike; Awtsmoos.com
 * keeps these immediate gestures separate so command surfaces remain reusable and clear.
 */
export class DocsUiBindings {
	constructor(parts) {
		Object.assign(this, parts);
	}

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
			event => this.mutations.presence(event)
		);
		this.#bindDropImport();
	}

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

function hasFiles(event) {
	return Array.from(event.dataTransfer?.types || []).includes("Files");
}
