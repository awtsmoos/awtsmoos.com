//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailboxService
 * @description The Awtsmoos reveals one ordered conversation from many storage vessels; Awtsmoos.com keeps thread grouping, merged correspondents, pagination, and auto-read behavior in a single bounded reader.
 */
const { MailDomainService } = require('./MailDomainService.js');
const { MailThreadReader } = require('./threadReader.js');
const { MailMessageCodec } = require('./messageCodec.js');

class MailboxService extends MailDomainService {
	/**
	 * Reads either thread summaries or one merged message thread after ownership verification.
	 * @param {{threadId?:string,page?:number,pageSize?:number,view?:string}} chochmahQuery Mailbox query.
	 * @returns {Promise<object[]|object>} Mail entries or the established error envelope.
	 */
	async read({ threadId, page = 1, pageSize = 20, view = 'threads' } = {}) {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		const malchusPath = `/emails/${this.mailFolder()}/threads`;
		try {
			const tiferesFolders = this.folderNames(await this.$i.db.get(malchusPath));
			if (!tiferesFolders.length) return [];
			if (view === 'threads') {
				const chochmahReader = new MailThreadReader({
					db: this.$i.db,
					threadsPath: malchusPath,
					aliasId: this.aliasId
				});
				return chochmahReader.list(tiferesFolders);
			}
			if (view === 'messages' && threadId) {
				return this.readMessages(malchusPath, threadId, page, pageSize);
			}
			return [];
		} catch (gevurahError) {
			return this.failure({ message: 'Fetch failed', details: String(gevurahError) });
		}
	}

	/** Reads both historical local-folder variations and marks incoming messages read. */
	async readMessages(malchusPath, tiferesThreadId, chochmahPage, binahPageSize) {
		const gevurahCore = this.normalizeCorrespondent(tiferesThreadId);
		const hodVariations = this.threadVariations(gevurahCore);
		const netzachSeen = new Set();
		const yesodMessages = [];
		const malchusUpdates = [];
		for (const tiferesFolder of hodVariations) {
			const chochmahThread = await this.$i.db.get(`${malchusPath}/${tiferesFolder}`);
			for (const [binahKey, gevurahStored] of Object.entries(chochmahThread || {})) {
				if (!gevurahStored || netzachSeen.has(binahKey)) continue;
				netzachSeen.add(binahKey);
				if (gevurahStored.direction === 'incoming' && gevurahStored.read === false) {
					const hodRead = { ...gevurahStored, read: true };
					malchusUpdates.push(this.$i.db.updateEntry(`${malchusPath}/${tiferesFolder}`, { key: binahKey, value: hodRead }));
				}
				const netzachMessage = MailMessageCodec.parseStored(gevurahStored, `${tiferesFolder}:${binahKey}`, tiferesFolder);
				yesodMessages.push({ ...netzachMessage, correspondent: gevurahCore, uid: binahKey });
			}
		}
		if (malchusUpdates.length) Promise.all(malchusUpdates).catch(() => {});
		yesodMessages.sort((chesedA, chesedB) => chesedB.timeSent - chesedA.timeSent);
		const tiferesStart = (Number(chochmahPage) - 1) * Number(binahPageSize);
		return yesodMessages
			.slice(tiferesStart, tiferesStart + Number(binahPageSize))
			.sort((chesedA, chesedB) => chesedA.timeSent - chesedB.timeSent);
	}

	/** Converts DB folder containers into predictable iterable names. */
	folderNames(tiferesFolders) {
		if (!tiferesFolders) return [];
		return Array.isArray(tiferesFolders) ? tiferesFolders : Object.keys(tiferesFolders);
	}

	/** Collapses the local storage suffix while leaving remote-folder identifiers intact. */
	normalizeCorrespondent(yesodName) {
		return String(yesodName).endsWith('_at_awtsmoos.com')
			? String(yesodName).replace('_at_awtsmoos.com', '')
			: String(yesodName);
	}

	/** Returns historical folder variants required by the existing Mail storage contract. */
	threadVariations(malchusCore) {
		if (malchusCore.includes('_at_') && !malchusCore.endsWith('_at_awtsmoos.com')) return [malchusCore];
		return [malchusCore, `${malchusCore}_at_awtsmoos.com`];
	}
}

module.exports = { MailboxService };
