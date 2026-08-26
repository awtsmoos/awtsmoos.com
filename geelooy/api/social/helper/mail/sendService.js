//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSendService
 * @description The Awtsmoos lets one surface command reveal the correct transport beneath; Awtsmoos.com keeps authorization, addressing, local rules, and SMTP choice in a small conductor rather than one tangled transmission file.
 */
const { MailDomainService } = require('./MailDomainService.js');
const { MailAddressResolver } = require('./addressResolver.js');
const { MailLocalDelivery } = require('./localDelivery.js');
const { MailRulesRunner } = require('./rulesRunner.js');
const { MailSmtpDelivery } = require('./smtpDelivery.js');

class MailSendService extends MailDomainService {
	/**
	 * Resolves compose data and delivers through the proven local or SMTP path after sender ownership verification.
	 * @param {{toAliasId?:string,toEmail?:string}} chochmahRecipient Recipient parameters from the route.
	 * @returns {Promise<object>} Existing-compatible send response or established API error envelope.
	 */
	async send(chochmahRecipient) {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		const tiferesRecipient = await new MailAddressResolver(this.$i).resolve(chochmahRecipient);
		if (!tiferesRecipient.ok) {
			return this.failure({ message: tiferesRecipient.message, code: tiferesRecipient.code });
		}
		const malchusCompose = this.composeFields();
		try {
			if (tiferesRecipient.isLocal) {
				return new MailLocalDelivery(this.$i).deliver({
					fromAlias: this.aliasId.toLowerCase(),
					toAlias: tiferesRecipient.short,
					toAddress: tiferesRecipient.address,
					subject: malchusCompose.subject,
					content: malchusCompose.content,
					onInbox: ({ settings }) => this.runRules(settings, tiferesRecipient, malchusCompose)
				});
			}
			return new MailSmtpDelivery(this.$i).deliver({
				fromAlias: this.aliasId.toLowerCase(),
				toAddress: tiferesRecipient.address,
				folder: tiferesRecipient.folder,
				subject: malchusCompose.subject,
				content: malchusCompose.content
			});
		} catch (gevurahError) {
			return this.failure({ message: 'Transmission failed', details: gevurahError.message });
		}
	}

	/** Reads compose fields from the historical POST/GET surfaces while coercing content safely to text. */
	composeFields() {
		const tiferesPost = this.$i.$_POST || {};
		const malchusGet = this.$i.$_GET || {};
		return {
			subject: String(tiferesPost.subject || malchusGet.subject || '(No Subject)'),
			content: String(tiferesPost.content || malchusGet.content || '')
		};
	}

	/** Runs inbox automation only after the original local message and forwarding shadow work are safely persisted. */
	async runRules(tiferesSettings, malchusRecipient, yesodCompose) {
		return new MailRulesRunner(this.$i).run({
			settings: tiferesSettings,
			fromAlias: this.aliasId.toLowerCase(),
			toAlias: malchusRecipient.short,
			subject: yesodCompose.subject,
			content: yesodCompose.content
		});
	}
}

module.exports = { MailSendService };
