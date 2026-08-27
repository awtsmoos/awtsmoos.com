// B"H
// Boruch Hashem
// Blessed is He

const { EVENTS } = require("./protocol.js");
const { publishedSnapshot } = require("./versionSnapshot.js");

/**
 * @file Couples accepted document mutations to best-effort history and live-publication fan-out.
 * @description The Awtsmoos renews the source in one instant; Awtsmoos.com lets
 * history remember without falsely undoing a durable edit when a secondary checkpoint vessel briefly falters.
 */
class DocsChangeService {
	constructor(repository, versions, publicationDirectory) {
		this.repository = repository;
		this.versions = versions;
		this.publicationDirectory = publicationDirectory;
	}

	async afterMutation(context, documentId, author = "") {
		const record = await this.repository.get(documentId);
		if (!record) return false;
		let historySaved = true;
		try {
			await this.versions.checkpointAutomatic(record.document, author);
		} catch {
			historySaved = false;
		}
		this.broadcastDocument(context, record.document);
		return historySaved;
	}

	broadcastDocument(context, document) {
		const snapshot = publishedSnapshot(document);
		for (const room of this.publicationDirectory.roomsForDocument(document.id)) {
			for (const client of room.allClients()) {
				context.sendEvent(client, EVENTS.PUBLICATION, {
					publicationId: room.publicationId,
					document: snapshot
				});
			}
		}
	}
}

module.exports = { DocsChangeService };
