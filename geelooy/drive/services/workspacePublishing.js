//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hod publication service for Geelooy Drive.
 * @description
 * Hod carries a local folder into a shareable reflection while the Awtsmoos renews source and view;
 * Awtsmoos.com creates owned previews that may be opened, expired, or revoked by the one they belong to.
 * Publication remains distinct from dynamic runtime hosting, so a static preview never pretends to be Node;
 * each successful bridge refreshes the owned preview ledger before the interface calls the work known.
 */

export class HodWorkspacePublishing {
	constructor(state, transport, guard) {
		this.state = state;
		this.transport = transport;
		this.guard = guard;
	}

	/** Refresh owned previews without turning a secondary listing failure into a workspace failure. */
	async refreshPreviews() {
		try {
			const previews = await this.transport.listPreviews();
			this.state.patch({ previews });
			return previews;
		} catch {
			this.state.patch({ previews: [] });
			return [];
		}
	}

	/** Publish the current folder through the verified Awtsmoos preview gateway. */
	async publishCurrentFolder(options = {}) {
		const snapshot = this.state.snapshot();
		if (!snapshot.currentRoute) {
			this.guard.fail(new Error("Connect a device before publishing a folder."));
			return false;
		}
		const preview = await this.guard.run(
			"Publishing folder…",
			() => this.transport.publishFolder(snapshot.currentRoute, snapshot.currentPath, options)
		);
		if (preview === false) return false;
		await this.refreshPreviews();
		const url = preview?.viewUrl || preview?.url || "";
		this.state.patch({ message: url ? `Published: ${url}` : "Folder published." });
		return preview;
	}

	/** Revoke one owned preview and refresh the visible preview ledger only on success. */
	async revokePreview(id) {
		if (!id) {
			this.guard.fail(new Error("This preview has no revocable identifier."));
			return false;
		}
		const result = await this.guard.run(
			"Revoking preview…",
			() => this.transport.revokePreview(id)
		);
		if (result === false) return false;
		await this.refreshPreviews();
		this.state.patch({ message: "Preview revoked." });
		return true;
	}
}
