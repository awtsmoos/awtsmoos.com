// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Connects embed and realtime infrastructure events to visible document state.
 * @description The Awtsmoos renews local and remote truth together; Awtsmoos.com
 * keeps socket and iframe events away from gestures while translating them into honest UI states.
 */
export class DocsInfrastructureBindings {
	constructor(parts) {
		Object.assign(this, parts);
	}

	bind() {
		this.embed.addEventListener(
			"initial-content",
			event => this.actions.loadEmbedded(event.detail)
		);
		this.embed.addEventListener(
			"save-result",
			event => this.persistence.acceptOsSaveResult(event.detail)
		);
		this.collaboration.addEventListener(
			"session",
			event => this.#session(event.detail)
		);
		this.collaboration.addEventListener(
			"remote-document",
			event => this.#remoteDocument(event.detail)
		);
		this.collaboration.addEventListener(
			"comments",
			() => this.#comments()
		);
		this.collaboration.addEventListener(
			"access",
			event => this.#access(event.detail)
		);
	}

	#session(detail) {
		const canEdit = Boolean(detail.permissions?.canEdit);
		this.view.setTitle(this.model.title);
		this.view.setEditingEnabled(canEdit);
		this.toolbar.setEditable(canEdit);
		this.commentPanel.render(this.comments.comments);
		this.mutations.refreshDerived();
	}

	#remoteDocument(payload) {
		if (payload.title !== undefined) {
			this.view.setTitle(payload.title);
		}
		this.persistence.persistDraft();
		this.mutations.refreshDerived();
	}

	#comments() {
		this.commentPanel.render(this.comments.comments);
		this.mutations.refreshDerived();
	}

	#access(payload) {
		if (!payload.revoked) return;
		this.view.setEditingEnabled(false);
		this.toolbar.setEditable(false);
		this.toast.show("Your editing access was revoked", "warning", 5200);
	}
}
