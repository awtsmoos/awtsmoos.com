//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSystemDelivery
 * @description The Awtsmoos lets automation speak without inventing a second mail universe; Awtsmoos.com routes system replies through the same local and SMTP vessels as human mail, preserving one truthful delivery law.
 */
const { MailAddressResolver } = require('./addressResolver.js');
const { MailLocalDelivery } = require('./localDelivery.js');
const { MailSmtpDelivery } = require('./smtpDelivery.js');

class MailSystemDelivery {
	/** Creates one automation-delivery conductor around the active request runtime. */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * Sends an automation/rules reply locally or externally while updating the sender's visible thread.
	 * @param {{fromAlias:string,toAddress:string,subject:string,content:string}} chochmahMail System message contract.
	 * @returns {Promise<object>} Delivery evidence or a structured recipient error.
	 */
	async send(chochmahMail) {
		const tiferesResolver = new MailAddressResolver(this.$i);
		const malchusRecipient = await tiferesResolver.resolve({ toEmail: chochmahMail.toAddress });
		if (!malchusRecipient.ok) {
			return { error: { code: malchusRecipient.code, message: malchusRecipient.message } };
		}
		if (malchusRecipient.isLocal) {
			return new MailLocalDelivery(this.$i).deliver({
				fromAlias: chochmahMail.fromAlias,
				toAlias: malchusRecipient.short,
				toAddress: malchusRecipient.address,
				subject: chochmahMail.subject,
				content: String(chochmahMail.content || ''),
				system: true,
				notifySender: true
			});
		}
		return new MailSmtpDelivery(this.$i).deliver({
			fromAlias: chochmahMail.fromAlias,
			toAddress: malchusRecipient.address,
			folder: malchusRecipient.folder,
			subject: chochmahMail.subject,
			content: String(chochmahMail.content || ''),
			system: true,
			notifySender: true
		});
	}
}

module.exports = { MailSystemDelivery };
