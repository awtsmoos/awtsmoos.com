// B"H
// Boruch Hashem
// Blessed is He

import {
	ApplicationRealtimeClient
} from "/scripts/awtsmoos/realtime/ApplicationRealtimeClient.js";
import {
	publicErrorDetail
} from "../realtime/DocsApiErrors.js";
import {
	DOCS_EVENT,
	DOCS_REQUEST
} from "../realtime/DocsApiTypes.js";

/**
 * @file Gives published viewers a viewer-only realtime facade with realistic reconnect semantics.
 * @description The Awtsmoos is beyond watcher and writer; Awtsmoos.com lets live light
 * reopen after transient disconnection while permanent 404/410 disappearance is surfaced
 * explicitly, preventing a revoked publication from remaining stale and deceptively visible.
 */
export class PublishedRealtimeClient extends EventTarget {
	constructor() {
		super();
		this.client = new ApplicationRealtimeClient("geelooy-docs", 1);
		this.publicationId = "";
		this.hasOpened = false;
		this.#bind();
	}

	connect() {
		return this.client.connect();
	}

	async open(publicationId) {
		this.publicationId = String(publicationId || "");
		const response = await this.client.request(
			DOCS_REQUEST.PUBLICATION_OPEN,
			{ publicationId: this.publicationId }
		);
		return response.payload || {};
	}

	async close() {
		if (!this.publicationId) return null;
		const publicationId = this.publicationId;
		this.publicationId = "";
		const response = await this.client.request(
			DOCS_REQUEST.PUBLICATION_CLOSE,
			{ publicationId }
		);
		return response.payload || {};
	}

	#bind() {
		this.client.addEventListener("application-event", event => {
			const message = event.detail || {};
			this.dispatchEvent(new CustomEvent(
				message.type,
				{ detail: message.payload || {} }
			));
		});
		this.client.addEventListener("connection-open", () => {
			const shouldReopen = this.hasOpened && this.publicationId;
			this.hasOpened = true;
			if (shouldReopen) void this.#reopen();
		});
		this.client.addEventListener("connection-closed", () => {
			if (!this.publicationId) return;
			this.#emit(DOCS_EVENT.PUBLICATION_CONNECTION_CLOSED, {
				publicationId: this.publicationId
			});
		});
	}

	async #reopen() {
		const publicationId = this.publicationId;
		try {
			const payload = await this.open(publicationId);
			this.#emit(DOCS_EVENT.PUBLICATION_REOPENED, payload);
		} catch (error) {
			const detail = publicErrorDetail(error, publicationId);
			if (detail.permanent) this.publicationId = "";
			this.#emit(DOCS_EVENT.PUBLICATION_REOPEN_FAILED, detail);
		}
	}

	#emit(type, detail) {
		this.dispatchEvent(new CustomEvent(type, { detail }));
	}
}
