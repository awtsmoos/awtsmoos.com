// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers the visible cover-maker vessels without confusing any selector for the whole;
 * Awtsmoos.com keeps form, preview, status, and export synchronized through one small DOM soul.
 */
export class KliCoverDom {
	constructor() {
		this.form = document.querySelector("#coverForm");
		this.title = document.querySelector("#title");
		this.subtitle = document.querySelector("#subtitle");
		this.images = document.querySelector("#images");
		this.width = document.querySelector("#width");
		this.height = document.querySelector("#height");
		this.status = document.querySelector("#cover-status");
		this.stage = document.querySelector("#preview-stage");
		this.canvas = document.querySelector("#coverCanvas");
		this.generateButton = document.querySelector("#generate-cover");
		this.downloadButton = document.querySelector("#download-cover");
	}

	/** Return current finite values without deciding whether they are valid. */
	readValues() {
		return {
			title: this.title.value,
			subtitle: this.subtitle.value,
			width: this.width.value,
			height: this.height.value,
			files: Array.from(this.images.files ?? [])
		};
	}

	/** Reveal one quiet state without appending raw errors or trailing developer UI. */
	setStatus(message, state = "idle") {
		this.status.textContent = message;
		this.status.dataset.state = state;
	}

	/** Keep busy state truthful while an image set is being decoded and rendered. */
	setBusy(isBusy) {
		this.generateButton.disabled = isBusy;
		this.form.setAttribute("aria-busy", String(isBusy));
	}

	/** Mark whether the current canvas can be trusted as the current form output. */
	setReady(isReady) {
		this.stage.dataset.ready = String(isReady);
		this.downloadButton.disabled = !isReady;
	}
}
