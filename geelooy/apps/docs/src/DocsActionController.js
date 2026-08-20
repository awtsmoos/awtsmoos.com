// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns user-triggered file, share, and embedded-document actions.
 * @description The Awtsmoos is beyond click and destination; Awtsmoos.com keeps
 * these larger actions away from keystroke mutations while every filesystem choice stays in-app.
 */
export class DocsActionController {
	constructor(parts) {
		Object.assign(this, parts);
	}

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

	async save() {
		try {
			const destination = await this.#driveDestination();
			if (destination === null) return null;
			const result = await this.persistence.save(destination);
			this.toast.show("Document saved", "success");
			return result;
		} catch (error) {
			this.#driveError(error, "Save failed");
			return null;
		}
	}

	async importFile() {
		try {
			return await this.fileController.importLocal();
		} catch (error) {
			this.#driveError(error, "Could not open document");
			return false;
		}
	}

	async importDropped(file) {
		try {
			return await this.fileController.importFile(file);
		} catch (error) {
			this.#driveError(error, "Could not import dropped file");
			return false;
		}
	}

	async exportFile(format) {
		try {
			return await this.fileController.exportAs(format);
		} catch (error) {
			this.#driveError(error, "Export failed");
			return null;
		}
	}

	openInCode() {
		return this.fileController.openCurrentInCode();
	}

	loadEmbedded(payload) {
		if (!payload?.content) return false;
		try {
			this.snapshot.applySerialized(payload.content);
			return true;
		} catch (error) {
			this.#driveError(error, "Could not open document");
			return false;
		}
	}

	async #driveDestination() {
		if (!this.persistence.needsDriveDestination()) return {};
		const defaults = this.persistence.defaultDriveDestination();
		const values = await this.quickDialog.ask({
			title: "Save to Drive",
			fields: [
				{ name: "aliasId", label: "Drive alias", value: defaults.aliasId, required: true },
				{ name: "path", label: "File path", value: defaults.path, required: true }
			],
			submitLabel: "Save"
		});
		return values || null;
	}

	#driveError(error, fallback) {
		this.status.drive(error?.message || fallback, "warning");
		this.toast.show(error?.message || fallback, "warning");
	}

	#liveError(error, fallback) {
		this.status.live(error?.message || fallback, "warning");
		this.toast.show(error?.message || fallback, "warning");
	}
}
