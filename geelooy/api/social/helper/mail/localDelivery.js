//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailLocalDelivery
 * @description The Awtsmoos joins sender and recipient without collapsing their distinct vessels; Awtsmoos.com persists both sides, respects gatekeeping, signals live UI, and only then lets forwarding or rules unfold.
 */
const { MailMessageRecords } = require('./messageRecords.js');
const { ForwardingDelivery } = require('../../../../../ayzarim/email/domain/forwardingDelivery.js');

class MailLocalDelivery {
	/** Creates one local delivery service around the active Awtsmoos request vessel. */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * Delivers one local message with sender/outbox, recipient/inbox, gatekeeper, sockets, forwarding, and optional post-inbox work.
	 * @param {{fromAlias:string,toAlias:string,toAddress:string,subject:string,content:string,system?:boolean,notifySender?:boolean,onInbox?:Function}} chochmahMail Delivery contract.
	 * @returns {Promise<object>} Compatibility success plus status/forwarding evidence.
	 */
	async deliver(chochmahMail) {
		const tiferesTime = Date.now();
		const malchusSenderFolder = `${chochmahMail.fromAlias}_at_awtsmoos.com`;
		const yesodRecipientFolder = `${chochmahMail.toAlias}_at_awtsmoos.com`;
		const binahOutgoing = MailMessageRecords.outgoing({
			from: chochmahMail.fromAlias,
			to: chochmahMail.toAddress,
			subject: chochmahMail.subject,
			content: chochmahMail.content,
			time: tiferesTime
		});
		await this.$i.db.appendToObj(`/emails/${malchusSenderFolder}/threads/${yesodRecipientFolder}`, {
			key: String(tiferesTime),
			value: binahOutgoing
		});
		this.notifySender(chochmahMail, binahOutgoing, yesodRecipientFolder, tiferesTime);
		const gevurahSettings = await this.$i.db.get(`/social/aliases/${chochmahMail.toAlias}/emailSettings`) || {};
		const hodStatus = this.deliveryStatus(chochmahMail, gevurahSettings);
		const netzachIncoming = MailMessageRecords.incoming({
			from: chochmahMail.fromAlias,
			to: chochmahMail.toAddress,
			subject: chochmahMail.subject,
			content: chochmahMail.content,
			time: tiferesTime,
			status: hodStatus
		});
		await this.$i.db.appendToObj(`/emails/${yesodRecipientFolder}/threads/${malchusSenderFolder}`, {
			key: String(tiferesTime),
			value: netzachIncoming
		});
		this.$i.ws?.sendToAlias?.(chochmahMail.toAlias, {
			type: 'NEW_MAIL',
			message: MailMessageRecords.socket(netzachIncoming, malchusSenderFolder, tiferesTime)
		});
		let yesodForwarding = { forwarded: 0, skipped: true, results: [] };
		if (hodStatus === 'inbox') {
			yesodForwarding = await new ForwardingDelivery(this.$i).forwardFromAlias({
				ownerAddress: chochmahMail.toAddress,
				fromAddress: `${chochmahMail.fromAlias}@awtsmoos.com`,
				subject: chochmahMail.subject,
				content: chochmahMail.content,
				text: chochmahMail.content,
				trail: []
			});
			await chochmahMail.onInbox?.({ settings: gevurahSettings, status: hodStatus });
		}
		return {
			success: { message: chochmahMail.system ? 'System mail delivered internally' : 'Sent internally' },
			status: hodStatus,
			forwarding: yesodForwarding
		};
	}

	/** Applies the existing gatekeeper contract unless the message is trusted system delivery. */
	deliveryStatus(chochmahMail, tiferesSettings) {
		if (chochmahMail.system || !tiferesSettings.gatekeeperMode) return 'inbox';
		const malchusApproved = tiferesSettings.approved || {};
		const yesodFull = `${chochmahMail.fromAlias}_at_awtsmoos.com`;
		return malchusApproved[chochmahMail.fromAlias] || malchusApproved[yesodFull] ? 'inbox' : 'request';
	}

	/** Notifies the sender only for system/automation flows that are not already optimistic in the compose UI. */
	notifySender(chochmahMail, tiferesOutgoing, malchusFolder, yesodTime) {
		if (!chochmahMail.notifySender) return;
		const binahSocket = MailMessageRecords.socket(tiferesOutgoing, malchusFolder, yesodTime);
		this.$i.ws?.sendToAlias?.(chochmahMail.fromAlias, { type: 'NEW_MAIL', message: binahSocket });
	}
}

module.exports = { MailLocalDelivery };
