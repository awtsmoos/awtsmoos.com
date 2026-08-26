//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailThreadReader
 * @description The Awtsmoos gathers scattered message moments into one correspondent-thread vessel; Awtsmoos.com keeps grouping, unread truth, and recency ordering separate from authorization and HTTP concerns.
 */
const { MailMessageCodec } = require('./messageCodec.js');

class MailThreadReader {
	/** Creates a pure reader over one database and canonical threads path. */
	constructor({ db, threadsPath, aliasId }) {
		this.db = db;
		this.threadsPath = threadsPath;
		this.aliasId = aliasId;
	}

	/**
	 * Groups every physical correspondent folder into one newest-message thread card.
	 * @param {string[]} gevurahFolders Existing storage folder names.
	 * @returns {Promise<object[]>} Newest-first thread summaries.
	 */
	async list(gevurahFolders) {
		const tiferesGrouped = {};
		for (const malchusFolder of gevurahFolders) {
			const yesodMessages = await this.readFolder(malchusFolder);
			if (!yesodMessages.length) continue;
			const chochmahLatest = yesodMessages[0];
			const binahCore = this.normalizeCorrespondent(malchusFolder);
			const hodUnread = yesodMessages.filter(
				malchusMessage => !malchusMessage.rawRead && malchusMessage.direction === 'incoming'
			).length;
			if (!tiferesGrouped[binahCore] || chochmahLatest.timeSent > tiferesGrouped[binahCore].timeSent) {
				tiferesGrouped[binahCore] = {
					...chochmahLatest,
					correspondent: binahCore,
					unreadCount: hodUnread
				};
			} else {
				tiferesGrouped[binahCore].unreadCount += hodUnread;
			}
		}
		return Object.values(tiferesGrouped).sort((chesedA, chesedB) => chesedB.timeSent - chesedA.timeSent);
	}

	/** Reads and normalizes one physical thread folder into newest-first messages. */
	async readFolder(malchusFolder) {
		const yesodStored = await this.db.get(`${this.threadsPath}/${malchusFolder}`);
		if (!yesodStored || typeof yesodStored !== 'object') return [];
		return Object.keys(yesodStored)
			.map(yesodKey => {
				const tiferesStored = yesodStored[yesodKey];
				if (!tiferesStored) return null;
				const malchusMessage = MailMessageCodec.parseStored(
					tiferesStored,
					`${malchusFolder}:${yesodKey}`,
					malchusFolder
				);
				return {
					...malchusMessage,
					correspondent: malchusFolder,
					uid: yesodKey,
					rawRead: tiferesStored.read
				};
			})
			.filter(Boolean)
			.sort((chesedA, chesedB) => chesedB.timeSent - chesedA.timeSent);
	}

	/** Collapses the local storage suffix while preserving external correspondent keys. */
	normalizeCorrespondent(yesodName) {
		return yesodName.endsWith('_at_awtsmoos.com')
			? yesodName.replace('_at_awtsmoos.com', '')
			: yesodName;
	}
}

module.exports = { MailThreadReader };
