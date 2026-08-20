// B"H
// Boruch Hashem
// Blessed is He

import {
	ApplicationRealtimeClient
} from "/scripts/awtsmoos/realtime/ApplicationRealtimeClient.js";

/**
 * @file Wraps the shared sitewide realtime wire for Awtsmoos Docs rooms and mutations.
 * @description The Awtsmoos is one before applications divide; Awtsmoos.com keeps
 * one physical socket while content, page layout, comments, sharing, and presence travel as named vessels.
 */
export class RealtimeClient extends EventTarget {
	constructor() {
		super();
		this.client = new ApplicationRealtimeClient(
			"geelooy-docs",
			1
		);
		this.currentJoin = null;
		this.hasOpened = false;
		this.#bind();
	}

	connect() {
		return this.client.connect();
	}

	create(document, displayName = "") {
		return this.#request(
			"docs.document.create",
			{ document, displayName }
		);
	}

	join(documentId, token = "", displayName = "") {
		this.currentJoin = { documentId, token, displayName };
		return this.#request(
			"docs.document.join",
			this.currentJoin
		);
	}

	async leave() {
		if (!this.currentJoin) return null;
		const payload = {
			documentId: this.currentJoin.documentId
		};
		this.currentJoin = null;
		return this.#request("docs.document.leave", payload);
	}

	patch(documentId, revision, blocks) {
		return this.#request(
			"docs.document.patch",
			{ documentId, revision, blocks }
		);
	}

	title(documentId, revision, title) {
		return this.#request(
			"docs.document.title",
			{ documentId, revision, title }
		);
	}

	layout(documentId, layout) {
		return this.#request(
			"docs.document.layout",
			{ documentId, layout }
		);
	}

	comment(documentId, mutation) {
		return this.#request(
			"docs.comment.mutate",
			{ documentId, mutation }
		);
	}

	access(documentId, mode) {
		return this.#request(
			"docs.access.update",
			{ documentId, mode }
		);
	}

	invite(documentId, accountId) {
		return this.#request(
			"docs.access.invite",
			{ documentId, accountId }
		);
	}

	presence(documentId, activeBlockId = "", mode = "viewing") {
		return this.#request(
			"docs.presence.update",
			{ documentId, activeBlockId, mode }
		);
	}

	async #request(type, payload) {
		const response = await this.client.request(type, payload);
		return response.payload || {};
	}

	#bind() {
		this.client.addEventListener("application-event", event => {
			const message = event.detail;
			this.dispatchEvent(new CustomEvent(
				message.type,
				{ detail: message.payload || {} }
			));
		});
		this.client.addEventListener("connection-closed", () => {
			this.dispatchEvent(new Event("connection-closed"));
		});
		this.client.addEventListener("connection-open", () => {
			const shouldRejoin = this.hasOpened && this.currentJoin;
			this.hasOpened = true;
			this.dispatchEvent(new Event("connection-open"));
			if (!shouldRejoin) return;
			const { documentId, token, displayName } = this.currentJoin;
			this.join(documentId, token, displayName).catch(() => {});
		});
	}
}
