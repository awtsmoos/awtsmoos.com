// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a generated light become a durable file without trapping the user;
 * Awtsmoos.com prefers an explicit save folder when chosen and always preserves a simple download fallback.
 */
export class HodDownloadManager {
	constructor(dom) {
		this.dom = dom;
		this.directoryHandle = null;
	}

	connect() {
		const supported = "showDirectoryPicker" in window;
		this.dom.directoryPickerContainer.hidden = !supported;
		if (!supported) {
			this.dom.useDirectoryPicker.checked = false;
		}
		return this;
	}

	/** @returns {Promise<boolean>} Whether generation may continue. */
	async prepareDirectory() {
		if (!this.dom.useDirectoryPicker.checked || !("showDirectoryPicker" in window)) {
			this.directoryHandle = null;
			return true;
		}
		try {
			this.directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
			return true;
		} catch (error) {
			if (error?.name === "AbortError") {
				return false;
			}
			throw error;
		}
	}

	/**
	 * @param {Blob} blob Generated JPEG.
	 * @param {string} caption Caption used to name the output.
	 * @param {number} index Batch index.
	 */
	async save(blob, caption, index) {
		const filename = this.createFilename(caption, index);
		if (this.directoryHandle) {
			const fileHandle = await this.directoryHandle.getFileHandle(
				filename,
				{ create: true }
			);
			const writable = await fileHandle.createWritable();
			await writable.write(blob);
			await writable.close();
			return;
		}
		this.downloadBlob(blob, filename);
	}

	createFilename(caption, index) {
		const sanitized = String(caption || "vision")
			.replace(/[^\p{L}\p{N}]+/gu, "_")
			.replace(/^_+|_+$/g, "")
			.slice(0, 48) || "vision";
		return `BH_${Date.now()}_EinSof_${sanitized}_${index + 1}.jpg`;
	}

	downloadBlob(blob, filename) {
		const href = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = href;
		anchor.download = filename;
		anchor.hidden = true;
		document.body.append(anchor);
		anchor.click();
		anchor.remove();
		setTimeout(() => URL.revokeObjectURL(href), 1000);
	}
}
