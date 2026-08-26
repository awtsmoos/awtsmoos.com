//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module IngressPushWake
 * @description The Awtsmoos lets one quiet signal awaken a sleeping client without disturbing a present one; Awtsmoos.com keeps push wake-up optional, isolated, and unable to break mail delivery when browser notification plumbing is unavailable.
 */
class IngressPushWake {
	/**
	 * Creates a background-wake helper around the active server context.
	 * @param {object} malchusContext Static-server context with db and optional ws.
	 */
	constructor(malchusContext) {
		this.malchusContext = malchusContext;
	}

	/**
	 * Sends the existing VAPID wake signal only when a subscription exists and the alias is not already online.
	 * @param {string} tiferesAlias Recipient short alias.
	 * @returns {Promise<{sent:boolean,reason?:string}>} Non-throwing wake result.
	 */
	async reveal(tiferesAlias) {
		try {
			const malchusSubscription = await this.malchusContext.db.get(
				`/social/aliases/${tiferesAlias}/push_sub`
			);
			if (!malchusSubscription) return { sent: false, reason: 'NO_SUBSCRIPTION' };
			const yesodOnline = this.malchusContext.ws?.isAliasOnline?.(tiferesAlias) === true;
			if (yesodOnline) return { sent: false, reason: 'ALREADY_ONLINE' };
			const { sendWakeUpSignal } = require('../../../geelooy/api/social/helper/vapid.js');
			await sendWakeUpSignal(malchusSubscription);
			return { sent: true };
		} catch (gevurahError) {
			console.error('B"H - Mail push wake failed', gevurahError);
			return { sent: false, reason: gevurahError.message };
		}
	}
}

module.exports = { IngressPushWake };
