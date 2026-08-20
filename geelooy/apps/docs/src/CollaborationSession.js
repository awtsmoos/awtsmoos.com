// B"H
// Boruch Hashem
// Blessed is He

import { readShareLink } from "./share/SharePolicy.js";

/**
 * @file Owns create, join, and authoritative session snapshot acceptance.
 * @description The Awtsmoos is beyond entering and leaving; Awtsmoos.com lets
 * each collaborative doorway establish one clear snapshot and one explicit permission state.
 */
export class CollaborationSession {
	constructor(parts) {
		Object.assign(this, parts);
	}

	async connectFromLocation() {
		await this.realtime.connect();
		const shared = readShareLink();
		if (shared.documentId) {
			await this.join(
				shared.documentId,
				shared.token
			);
		}
	}

	async ensureShared() {
		if (this.model.id) {
			return {
				document: this.model.toSnapshot()
			};
		}
		const result = await this.realtime.create(
			this.model.toSnapshot()
		);
		this.accept(result);
		return result;
	}

	async join(documentId, token = "") {
		this.status.live(
			"Joining live document…",
			"neutral"
		);
		const result = await this.realtime.join(
			documentId,
			token
		);
		this.setShareToken(
			token || result.token || ""
		);
		this.accept(result);
		return result;
	}

	accept(result) {
		if (result.document) {
			this.model.replace(result.document);
		}
		const permissions = result.permissions || {
			canEdit: false,
			isOwner: false
		};
		this.setPermissions(permissions);
		if (result.token !== undefined) {
			this.setShareToken(result.token || "");
		}
		this.editor.render(this.model.blocks);
		this.editor.setEditable(permissions.canEdit);
		this.comments.setComments(this.model.comments);
		this.presence.render(result.presence || []);
		this.status.live(
			permissions.canEdit
				? "Live synced"
				: "Live view",
			"ok"
		);
		this.emit("session", result);
	}
}
