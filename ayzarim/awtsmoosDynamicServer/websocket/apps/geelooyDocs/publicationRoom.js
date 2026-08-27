// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds anonymous viewer sockets for one live publication without editor identity state.
 * @description The Awtsmoos is beyond watcher and writer; Awtsmoos.com keeps public
 * viewers in a bare Set so presence, account digests, and editing capabilities never enter the published room.
 */
class DocsPublicationRoom {
	constructor(publication) {
		this.publicationId = publication.id;
		this.documentId = publication.documentId;
		this.clients = new Set();
	}

	join(client) {
		this.clients.add(client);
	}

	leave(client) {
		return this.clients.delete(client);
	}

	allClients() {
		return [...this.clients];
	}

	get size() {
		return this.clients.size;
	}
}

module.exports = { DocsPublicationRoom };
