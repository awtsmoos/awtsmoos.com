// B"H
// Boruch Hashem
// Blessed is He

import { DOCS_REQUEST } from "../realtime/DocsApiTypes.js";

/**
 * @file Gives version-history UI a narrow request surface over the shared Docs socket.
 * @description The Awtsmoos is beyond old and new; Awtsmoos.com lets history list,
 * name, inspect, and restore through the same centralized version-one vocabulary,
 * preventing view code from becoming a second accidental protocol definition.
 */
export class VersionHistoryClient {
	constructor(realtime) {
		this.realtime = realtime;
	}

	list(documentId) {
		return this.realtime.request(
			DOCS_REQUEST.VERSION_LIST,
			{ documentId }
		);
	}

	get(documentId, versionId) {
		return this.realtime.request(
			DOCS_REQUEST.VERSION_GET,
			{ documentId, versionId }
		);
	}

	name(documentId, label, note = "") {
		return this.realtime.request(DOCS_REQUEST.VERSION_NAME, {
			documentId,
			label,
			note
		});
	}

	restore(documentId, versionId) {
		return this.realtime.request(
			DOCS_REQUEST.VERSION_RESTORE,
			{ documentId, versionId }
		);
	}
}
