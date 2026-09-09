// B"H
// Boruch Hashem
// Blessed is He

import { validateMessagingImage } from "./MessagingImagePolicy.js";

/**
 * @file Owns local private-image selection, preview, cleanup, and busy state before durable delivery.
 * @description
 * The Awtsmoos contains the chosen image before local URL, metadata, and transport divide. Awtsmoos.com
 * keeps preview authority local and revocable, disables conflicting voice capture, and exposes only the
 * selected File to the sender so durable persistence remains a separate responsibility.
 */
export class MessagingImageComposer {
	constructor(elements) {
		this.elements = elements;
		this.selectedFile = null;
		this.previewUrl = "";
		this.busy = false;
		this.bind();
	}

	/** Binds the visible photo control to one hidden semantic file input and explicit cancellation. */
	bind() {
		this.elements.imagePick?.addEventListener("click", () => this.elements.imageInput?.click());
		this.elements.imageInput?.addEventListener("change", () => this.selectFromInput());
		this.elements.imageCancel?.addEventListener("click", () => this.reset());
	}

	/** Validates and previews the first selected file without uploading or persisting it yet. */
	selectFromInput() {
		try {
			const file = validateMessagingImage(this.elements.imageInput?.files?.[0]);
			this.select(file);
		} catch (error) {
			this.elements.status.textContent = error?.message || "Image could not be selected.";
			this.elements.imageInput.value = "";
		}
	}
	/** Replaces the current local selection and revokes any older preview URL first. */
	select(file) {
		this.clearPreview();
		this.selectedFile = validateMessagingImage(file);
		this.previewUrl = URL.createObjectURL(this.selectedFile);
		this.elements.imagePreview.src = this.previewUrl;
		this.elements.imageName.textContent = this.selectedFile.name || "Private image";
		this.elements.imageMeta.textContent = formatBytes(this.selectedFile.size);
		this.elements.imagePanel.hidden = false;
		this.elements.composer.classList.add("is-image-active");
		this.elements.voiceStart.disabled = true;
		this.elements.imagePick.classList.add("has-image");
		return this.selectedFile;
	}

	/** Returns the currently selected File without granting any transport authority. */
	file() {
		return this.selectedFile;
	}

	/** Locks image mutation while the exact selected File is entering durable custody. */
	setBusy(busy) {
		this.busy = Boolean(busy);
		this.elements.imagePick.disabled = this.busy;
		this.elements.imageCancel.disabled = this.busy;
		this.elements.imageInput.disabled = this.busy;
	}
	/** Releases preview memory and returns the composer to text/voice-ready state. */
	reset() {
		this.clearPreview();
		this.selectedFile = null;
		this.busy = false;
		if (this.elements.imageInput) {
			this.elements.imageInput.value = "";
			this.elements.imageInput.disabled = false;
		}
		this.elements.imagePanel.hidden = true;
		this.elements.imagePreview.removeAttribute("src");
		this.elements.imageName.textContent = "";
		this.elements.imageMeta.textContent = "";
		this.elements.imagePick.disabled = false;
		this.elements.imageCancel.disabled = false;
		this.elements.voiceStart.disabled = false;
		this.elements.imagePick.classList.remove("has-image");
		this.elements.composer.classList.remove("is-image-active");
	}

	clearPreview() {
		if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
		this.previewUrl = "";
	}
}

function formatBytes(value) {
	const bytes = Number(value || 0);
	return bytes >= 1024 * 1024
		? `${(bytes / 1024 / 1024).toFixed(1)} MB`
		: `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}
