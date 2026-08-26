//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module IngressMessageNormalizer
 * @description The Awtsmoos reveals one coherent letter before its recipients branch apart; Awtsmoos.com decodes sender, subject, body, inline images, and forwarding trail once so every mailbox receives the same truthful source.
 */
const { canonicalAddress } = require('../domain/forwardingPolicy.js');
const { MimeContentCleanup } = require('../mime/contentCleanup.js');
const { MimeHeaderCodec } = require('../mime/headerCodec.js');
const { AwtsmoosMimeParser } = require('../mime/mimeParser.js');
const { IngressMessageSafety } = require('./messageSafety.js');

class IngressMessageNormalizer {
	/**
	 * Converts raw SMTP ingress into one recipient-independent message contract.
	 * @param {{sender:string,data:string|Buffer}} chochmahEnvelope Raw transport envelope.
	 * @returns {object} Decoded and cleaned message ready for recipient delivery.
	 */
	static reveal(chochmahEnvelope) {
		const tiferesParsed = AwtsmoosMimeParser.parse(chochmahEnvelope.data);
		const malchusDecodedFrom = MimeHeaderCodec.decode(
			tiferesParsed.headers.from || chochmahEnvelope.sender
		);
		const yesodSender = MimeHeaderCodec.sender(malchusDecodedFrom);
		const binahSenderAddress = canonicalAddress(
			yesodSender.email || chochmahEnvelope.sender
		);
		const gevurahSubject = MimeHeaderCodec.decode(
			tiferesParsed.headers.subject || ''
		) || '(No Subject)';
		const hodText = MimeContentCleanup.stripTextHistory(tiferesParsed.text || '');
		let netzachHtml = MimeContentCleanup.stripHtmlHistory(tiferesParsed.html || '');
		if (netzachHtml && tiferesParsed.attachments.length) {
			netzachHtml = MimeContentCleanup.embedInlineImages(
				netzachHtml,
				tiferesParsed.attachments
			);
		}
		if (!netzachHtml && hodText) {
			netzachHtml = MimeContentCleanup.textToHtml(hodText);
		}
		return {
			time: Date.now(),
			headers: tiferesParsed.headers,
			messageId: tiferesParsed.headers['message-id'] || null,
			decodedFrom: malchusDecodedFrom,
			senderName: yesodSender.name,
			senderAddress: binahSenderAddress,
			subject: gevurahSubject,
			text: hodText,
			html: netzachHtml,
			attachments: tiferesParsed.attachments,
			forwardingTrail: IngressMessageSafety.forwardingTrail(tiferesParsed.headers)
		};
	}
}

module.exports = { IngressMessageNormalizer };
