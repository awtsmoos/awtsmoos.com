// B"H
// Boruch Hashem
// Blessed is He

import {
	ApplicationRealtimeClient
} from "/scripts/awtsmoos/realtime/ApplicationRealtimeClient.js";
import { DOCS_REQUEST } from "./DocsApiTypes.js";
import { bindDocsRealtimeEvents } from "./RealtimeEventBridge.js";

/**
 * @file Wraps the shared sitewide realtime wire for editable Awtsmoos Docs requests.
 * @description The Awtsmoos is one before request types divide; Awtsmoos.com keeps
 * one socket and one centralized protocol vocabulary while capability discovery,
 * editing, comments, access, and presence remain explicit browser methods.
 */
export class RealtimeClient extends EventTarget {
	constructor() {
		super();
		this.client = new ApplicationRealtimeClient("geelooy-docs", 1);
		this.currentJoin = null;
		this.hasOpened = false;
		bindDocsRealtimeEvents(this);
	}

	connect() {
		return this.client.connect();
	}

	request(type, payload = {}) {
		return this.client.request(type, payload)
			.then(response => response.payload || {});
	}

	capabilities() {
		return this.request(DOCS_REQUEST.CAPABILITIES);
	}

	create(document, displayName = "") {
		return this.request(DOCS_REQUEST.CREATE, { document, displayName });
	}

	join(documentId, token = "", displayName = "") {
		this.currentJoin = { documentId, token, displayName };
		return this.request(DOCS_REQUEST.JOIN, this.currentJoin);
	}

	async leave() {
		if (!this.currentJoin) return null;
		const documentId = this.currentJoin.documentId;
		this.currentJoin = null;
		return this.request(DOCS_REQUEST.LEAVE, { documentId });
	}

	patch(documentId, revision, blocks) {
		return this.request(DOCS_REQUEST.PATCH, {
			documentId,
			revision,
			blocks
		});
	}

	title(documentId, revision, title) {
		return this.request(DOCS_REQUEST.TITLE, {
			documentId,
			revision,
			title
		});
	}

	layout(documentId, layout) {
		return this.request(DOCS_REQUEST.LAYOUT, { documentId, layout });
	}

	comment(documentId, mutation) {
		return this.request(DOCS_REQUEST.COMMENT, { documentId, mutation });
	}

	access(documentId, mode) {
		return this.request(DOCS_REQUEST.ACCESS, { documentId, mode });
	}

	invite(documentId, accountId) {
		return this.request(DOCS_REQUEST.INVITE, { documentId, accountId });
	}

	presence(documentId, activeBlockId = "", mode = "viewing") {
		return this.request(DOCS_REQUEST.PRESENCE, {
			documentId,
			activeBlockId,
			mode
		});
	}
}
