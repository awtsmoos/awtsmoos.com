// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies server-originated document, replacement, note, access, and presence events.
 * @description The Awtsmoos renews sender and receiver in one truth; Awtsmoos.com
 * keeps remote effects explicit so ordinary patches stay small while version restore may replace the whole visible vessel.
 */
export class CollaborationRemoteEvents {
	constructor(parts) {
		Object.assign(this, parts);
	}

	bind() {
		this.realtime.addEventListener(
			"connection-closed",
			() => this.status.live("Reconnecting…", "warning")
		);
		this.realtime.addEventListener(
			"docs.document.changed",
			event => this.#document(event.detail)
		);
		this.realtime.addEventListener(
			"docs.document.replaced",
			event => this.#replacement(event.detail)
		);
		this.realtime.addEventListener(
			"docs.comments.changed",
			event => this.#comments(event.detail)
		);
		this.realtime.addEventListener(
			"docs.access.changed",
			event => this.#access(event.detail)
		);
		this.realtime.addEventListener(
			"docs.presence.changed",
			event => this.presence.render(event.detail.participants || [])
		);
	}

	#document(payload) {
		if (payload.blocks) {
			this.model.patchBlocks(payload.blocks, payload.revision);
			this.editor.applyRemoteBlocks(payload.blocks);
		}
		if (payload.title !== undefined) this.model.title = payload.title;
		if (payload.layout) this.layout?.applyRemote(payload.layout);
		this.model.revision = payload.revision ?? this.model.revision;
		this.emit("remote-document", payload);
	}

	#replacement(payload) {
		const document = payload.document;
		if (!document) return;
		this.model.replace(document);
		this.editor.render(this.model.blocks);
		this.layout?.applyRemote(this.model.layout);
		this.comments.setComments(this.model.comments);
		this.emit("remote-replacement", { document: this.model.toSnapshot() });
	}

	#comments(payload) {
		this.model.comments = payload.comments || [];
		this.comments.setComments(this.model.comments);
		this.emit("comments", payload);
	}

	#access(payload) {
		this.model.access = payload.access || this.model.access;
		if (payload.revoked) {
			this.editor.setEditable(false);
			this.status.live("Access revoked · read only", "warning");
			this.onRevoked?.();
		}
		this.emit("access", payload);
	}
}
