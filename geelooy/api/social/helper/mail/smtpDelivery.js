//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSmtpDelivery
 * @description The Awtsmoos crosses the boundary between local vessel and distant mailbox without confusion; Awtsmoos.com keeps SMTP formatting, capsules, and automation headers in one transport-only service.
 */
const { MailMessageCodec } = require('./messageCodec.js');
const { MailMessageRecords } = require('./messageRecords.js');

class MailSmtpDelivery {
	/** Creates an SMTP delivery vessel around the current request runtime. */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * Stores one sender-side copy and sends the external message when SMTP exists.
	 * @param {{fromAlias:string,toAddress:string,folder:string,subject:string,content:string,system?:boolean,notifySender?:boolean}} chochmahMail Delivery contract.
	 * @returns {Promise<object>} Compatibility success or explicit SMTP-missing state.
	 */
	async deliver(chochmahMail) {
		const tiferesTime = Date.now();
		const malchusFromFolder = `${chochmahMail.fromAlias}_at_awtsmoos.com`;
		const yesodOutgoing = MailMessageRecords.outgoing({
			from: chochmahMail.fromAlias,
			to: chochmahMail.toAddress,
			subject: chochmahMail.subject,
			content: chochmahMail.content,
			time: tiferesTime
		});
		await this.$i.db.appendToObj(`/emails/${malchusFromFolder}/threads/${chochmahMail.folder}`, {
			key: String(tiferesTime),
			value: yesodOutgoing
		});
		if (chochmahMail.notifySender) {
			this.$i.ws?.sendToAlias?.(chochmahMail.fromAlias, {
				type: 'NEW_MAIL',
				message: MailMessageRecords.socket(yesodOutgoing, chochmahMail.folder, tiferesTime)
			});
		}
		if (!this.$i.mail?.smtpClient) {
			return { success: { message: 'SMTP Client Missing' }, smtpDelivered: false };
		}
		const binahCapsules = MailMessageCodec.extractCapsules(chochmahMail.content);
		const gevurahBody = this.htmlBody(binahCapsules.cleanText);
		const hodHeaders = chochmahMail.system
			? {
				'Content-Type': 'text/html; charset=utf-8',
				'Auto-Submitted': 'auto-replied',
				'Precedence': 'bulk',
				'X-Auto-Response-Suppress': 'All'
			}
			: { 'Content-Type': 'text/html; charset=utf-8' };
		await this.$i.mail.smtpClient.sendMail(
			`${chochmahMail.fromAlias}@awtsmoos.com`,
			chochmahMail.toAddress,
			chochmahMail.subject,
			gevurahBody,
			hodHeaders,
			binahCapsules.attachments
		);
		return { success: { message: 'Sent via SMTP (HTML + Capsules)' }, smtpDelivered: true };
	}

	/** Wraps plain compose text as safe whitespace-preserving HTML while preserving intentional HTML bodies. */
	htmlBody(tiferesText) {
		const malchusText = String(tiferesText || '');
		if (/^\s*<(div|p|html|body|table)/i.test(malchusText)) return malchusText;
		const yesodEscaped = malchusText
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\n/g, '<br>');
		return `<div dir="auto" style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;">${yesodEscaped}</div>`;
	}
}

module.exports = { MailSmtpDelivery };
