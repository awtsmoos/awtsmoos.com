//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module IngressRecipientStorage
 * @description The Awtsmoos lets truth become durable before any echo travels; Awtsmoos.com keeps settings, original inbox persistence, and live socket reflection in one small Malchus vessel so later shadow work can never outrun the stored source.
 */
class IngressRecipientStorage {
	/**
	 * Creates recipient persistence around the active static-server context.
	 * @param {object} malchusContext Server context exposing db and optional ws.
	 */
	constructor(malchusContext) {
		this.malchusContext = malchusContext;
	}

	/**
	 * Reads one alias's complete Mail settings while supplying non-destructive defaults.
	 * @param {string} tiferesAlias Recipient short alias.
	 * @returns {Promise<object>} Existing settings or stable defaults.
	 */
	async settings(tiferesAlias) {
		return await this.malchusContext.db.get(`/social/aliases/${tiferesAlias}/emailSettings`)
			|| {
				approved: {},
				rules: [],
				customScript: '',
				forwarding: { enabled: false, targets: [] }
			};
	}

	/**
	 * Persists one original incoming record before forwarding, push, or automation begins.
	 * @param {string} malchusRecipientFolder Recipient storage folder.
	 * @param {object} tiferesRecord Stable incoming record.
	 * @returns {Promise<void>} Resolves only after the database append completes.
	 */
	async store(malchusRecipientFolder, tiferesRecord) {
		const yesodPath = `/emails/${malchusRecipientFolder}/threads/${tiferesRecord.correspondent}`;
		await this.malchusContext.db.appendToObj(yesodPath, {
			key: tiferesRecord.uid,
			value: tiferesRecord
		});
	}

	/**
	 * Reflects one already-persisted incoming message to the existing Mail websocket client.
	 * @param {string} tiferesAlias Recipient alias.
	 * @param {object} malchusRecord Persisted incoming record.
	 */
	notify(tiferesAlias, malchusRecord) {
		const yesodText = String(malchusRecord.textContent || '');
		this.malchusContext.ws?.sendToAlias?.(tiferesAlias, {
			type: 'NEW_MAIL',
			message: {
				...malchusRecord,
				snippet: `${yesodText.slice(0, 50)}${yesodText.length > 50 ? '...' : ''}`
			}
		});
	}
}

module.exports = { IngressRecipientStorage };
