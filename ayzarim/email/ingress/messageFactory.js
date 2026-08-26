//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module IngressMessageFactory
 * @description The Awtsmoos gives one incoming letter a clear local garment; Awtsmoos.com converts parsed MIME into stable inbox records and browser-safe attachment data without mixing persistence, rules, or transport.
 */
class IngressMessageFactory {
	/**
	 * Builds one recipient-side stored message from already-decoded transport data.
	 * @param {object} chochmahInput Normalized SMTP ingress context.
	 * @returns {object} Stable incoming mail record.
	 */
	static build(chochmahInput) {
		const tiferesTime = chochmahInput.time || Date.now();
		const malchusSenderFolder = chochmahInput.senderAddress.replace('@', '_at_');
		const yesodText = String(chochmahInput.text || '');
		return {
			id: `${malchusSenderFolder}:${tiferesTime}`,
			uid: String(tiferesTime),
			messageId: chochmahInput.messageId || null,
			status: chochmahInput.status || 'inbox',
			subject: chochmahInput.subject || '(No Subject)',
			content: String(chochmahInput.html || ''),
			textContent: yesodText,
			snippet: yesodText.slice(0, 100),
			attachments: this.attachments(chochmahInput.attachments || []),
			from: chochmahInput.decodedFrom || chochmahInput.senderAddress,
			fromName: chochmahInput.senderName || '',
			fromEmail: chochmahInput.senderAddress,
			correspondent: malchusSenderFolder,
			time: tiferesTime,
			timeSent: tiferesTime,
			read: false,
			direction: 'incoming',
			forwardingTrail: chochmahInput.forwardingTrail || []
		};
	}

	/**
	 * Converts byte-preserving parsed attachments into JSON-safe data URLs for the existing Mail client.
	 * @param {Array<object>} tiferesAttachments Parsed MIME attachments.
	 * @returns {Array<object>} Serializable client-safe attachment metadata.
	 */
	static attachments(tiferesAttachments) {
		return tiferesAttachments
			.filter(malchusAttachment => !malchusAttachment.wasEmbedded)
			.map(yesodAttachment => {
				const binahContent = Buffer.isBuffer(yesodAttachment.content)
					? yesodAttachment.content
					: Buffer.from(String(yesodAttachment.content || ''));
				const gevurahMime = yesodAttachment.contentType || 'application/octet-stream';
				return {
					filename: yesodAttachment.filename || 'attachment',
					contentType: gevurahMime,
					contentId: yesodAttachment.contentId || null,
					data: `data:${gevurahMime};base64,${binahContent.toString('base64')}`
				};
			});
	}
}

module.exports = { IngressMessageFactory };
