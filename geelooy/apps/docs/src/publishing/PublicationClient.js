// B"H
// Boruch Hashem
// Blessed is He

import { DOCS_REQUEST } from "../realtime/DocsApiTypes.js";

/**
 * @file Gives editor publishing UI a narrow owner-only request surface over the shared socket.
 * @description The Awtsmoos is beyond hidden and revealed; Awtsmoos.com keeps owner
 * publication creation, listing, and revocation tied to one protocol vocabulary so
 * an opaque viewer id can never drift into the role of an editing credential.
 */
export class PublicationClient {
	constructor(realtime) {
		this.realtime = realtime;
	}

	list(documentId) {
		return this.realtime.request(
			DOCS_REQUEST.PUBLICATION_LIST,
			{ documentId }
		);
	}

	create(documentId, mode) {
		return this.realtime.request(
			DOCS_REQUEST.PUBLICATION_CREATE,
			{ documentId, mode }
		);
	}

	revoke(documentId, publicationId) {
		return this.realtime.request(
			DOCS_REQUEST.PUBLICATION_REVOKE,
			{ documentId, publicationId }
		);
	}
}
