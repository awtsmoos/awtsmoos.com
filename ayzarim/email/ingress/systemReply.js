//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module IngressSystemReply
 * @description The Awtsmoos lets an automated answer return through one guarded channel; Awtsmoos.com keeps SMTP suppression headers, sent-copy persistence, and socket reflection together without mixing them into recipient ingestion.
 */
const { MimeBodyCodec } = require('../mime/bodyCodec.js');

class IngressSystemReply {
	/**
	 * Creates an automated reply service around the bound static-server context.
	 * @param {object} malchusContext Server context with db, mail, and optional ws.
	 */
	constructor(malchusContext) {
		this.malchusContext = malchusContext;
	}

	/**
	 * Sends one guarded auto-reply and optionally mirrors it into the local sender's Sent thread.
	 * @param {{fromAlias:string,toEmail:string,subject:string,body:string,saveToSent?:boolean}} chochmahReply Reply contract.
	 * @returns {Promise<{sent:boolean,saved:boolean}>} Delivery evidence without throwing into ingress.
	 */
	async send(chochmahReply) {
		const tiferesFrom = `${chochmahReply.fromAlias}@awtsmoos.com`;
		const malchusHtml = `<div dir="auto" style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;">${MimeBodyCodec.escapeHtml(chochmahReply.body).replace(/\r?\n/g, '<br>')}</div>`;
		let yesodSent = false;
		if (this.malchusContext.mail?.smtpClient) {
			try {
				await this.malchusContext.mail.smtpClient.sendMail(
					tiferesFrom,
					chochmahReply.toEmail,
					chochmahReply.subject,
					malchusHtml,
					this.automationHeaders()
				);
				yesodSent = true;
			} catch (gevurahError) {
				console.error('B"H - Automated mail reply failed', gevurahError);
			}
		}
		const binahSaved = chochmahReply.saveToSent
			? await this.saveSentCopy(chochmahReply)
			: false;
		return { sent: yesodSent, saved: binahSaved };
	}

	/**
	 * Returns headers that prevent compliant remote systems from auto-replying to automation.
	 * @returns {object} Stable SMTP suppression headers.
	 */
	automationHeaders() {
		return {
			'Content-Type': 'text/html; charset=utf-8',
			'Auto-Submitted': 'auto-replied',
			'Precedence': 'bulk',
			'X-Auto-Response-Suppress': 'All'
		};
	}

	/**
	 * Persists one automated outgoing record and reflects it to the local Mail socket.
	 * @param {object} chochmahReply Reply contract from send().
	 * @returns {Promise<boolean>} True after the local sent copy is stored.
	 */
	async saveSentCopy(chochmahReply) {
		try {
			const tiferesTime = Date.now();
			const malchusFrom = `${chochmahReply.fromAlias}_at_awtsmoos.com`;
			const yesodTo = String(chochmahReply.toEmail).trim().toLowerCase().replace('@', '_at_');
			const binahMessage = {
				id: `${chochmahReply.fromAlias}:${tiferesTime}`,
				uid: String(tiferesTime),
				from: chochmahReply.fromAlias,
				to: chochmahReply.toEmail,
				subject: chochmahReply.subject,
				content: chochmahReply.body,
				time: tiferesTime,
				timeSent: tiferesTime,
				read: true,
				direction: 'outgoing',
				correspondent: yesodTo
			};
			await this.malchusContext.db.appendToObj(`/emails/${malchusFrom}/threads/${yesodTo}`, { key: String(tiferesTime), value: binahMessage });
			this.malchusContext.ws?.sendToAlias?.(chochmahReply.fromAlias, { type: 'NEW_MAIL', message: binahMessage });
			return true;
		} catch (gevurahError) {
			console.error('B"H - Automated sent-copy save failed', gevurahError);
			return false;
		}
	}
}

module.exports = { IngressSystemReply };
