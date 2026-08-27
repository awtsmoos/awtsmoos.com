// B"H
// Boruch Hashem
// Blessed is He

import { chooseDocsSaveDestination } from "./DocsSaveDestination.js";

/**
 * @file Owns user-triggered file, share, and embedded-document actions.
 * @description The Awtsmoos is beyond click and destination; Awtsmoos.com keeps
 * larger actions away from keystroke mutations while embedded documents flow
 * through the same truthful format boundary used by local and cross-app opening.
 */
export class DocsActionController {
	constructor(parts) {
		Object.assign(this, parts);
	}

	/** Ensures a collaborative identity exists, then reveals the current share workspace. */
	async openShare() {
		try {
			await this.collaboration.ensureShared();
			this.share.open(
				this.model.id,
				this.model.access,
				this.collaboration.shareToken
			);
		} catch (error) {
			this.#liveError(error, "Sign in to share");
		}
	}

	/** Saves to the embedded OS file or to a chosen Drive destination. */
	async save() {
		try {
			const destination = await chooseDocsSaveDestination(
				this.persistence,
				this.quickDialog
			);
			if (destination === null) return null;
			const result = await this.persistence.save(destination);
			this.toast.show("Document saved", "success");
			return result;
		} catch (error) {
			this.#driveError(error, "Save failed");
			return null;
		}
	}

	/** Opens the browser file chooser and imports the selected supported document. */
	async importFile() {
		try {
			return await this.fileController.importLocal();
		} catch (error) {
			this.#driveError(error, "Could not open document");
			return false;
		}
	}

	/** Imports one dropped file through the same importer as the file chooser. */
	async importDropped(file) {
		try {
			return await this.fileController.importFile(file);
		} catch (error) {
			this.#driveError(error, "Could not import dropped file");
			return false;
		}
	}

	/** Exports the current document through one explicit destination format. */
	async exportFile(format) {
		try {
			return await this.fileController.exportAs(format);
		} catch (error) {
			this.#driveError(error, "Export failed");
			return null;
		}
	}

	/** Opens the current semantic document source inside Awtsmoos Code. */
	openInCode() {
		return this.fileController.openCurrentInCode();
	}

	/** Loads the file selected by Geelooy OS through the real source-format codecs. */
	loadEmbedded(payload) {
		if (payload?.content == null) return false;
		try {
			return this.fileController.importEmbedded(payload);
		} catch (error) {
			this.#driveError(error, "Could not open embedded document");
			return false;
		}
	}

	/** Reports persistence/import/export failures through both status and transient feedback vessels. */
	#driveError(error, fallback) {
		this.status.drive(error?.message || fallback, "warning");
		this.toast.show(error?.message || fallback, "warning");
	}

	/** Reports collaboration/share failures through the live status channel and toast surface. */
	#liveError(error, fallback) {
		this.status.live(error?.message || fallback, "warning");
		this.toast.show(error?.message || fallback, "warning");
	}
}
