//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailMessageCodec
 * @description The Awtsmoos reveals one readable message from old raw records and new structured vessels; Awtsmoos.com keeps parsing and HTML-capsule extraction pure so storage and transport never blur together.
 */
class MailMessageCodec {
	/**
	 * Normalizes one persisted mail entry without mutating its source record.
	 * @param {object} tiferesEntry Persisted message entry.
	 * @param {string} yesodId Stable composite message id.
	 * @param {string} malchusFriend Storage folder/correspondent name.
	 * @returns {object} Client-facing mail shape.
	 */
	static parseStored(tiferesEntry, yesodId, malchusFriend) {
		if (tiferesEntry.rawData) {
			return this.parseRawStored(tiferesEntry, yesodId, malchusFriend);
		}
		return {
			id: yesodId,
			from: tiferesEntry.from,
			fromName: tiferesEntry.fromName,
			fromEmail: tiferesEntry.fromEmail,
			subject: tiferesEntry.subject,
			content: String(tiferesEntry.content || ''),
			attachments: tiferesEntry.attachments || [],
			timeSent: Number.parseInt(tiferesEntry.time, 10) || Date.now(),
			read: tiferesEntry.read || false,
			direction: tiferesEntry.direction,
			isRaw: false
		};
	}

	/** Converts one legacy RFC-like raw record into the same client-facing message shape. */
	static parseRawStored(chochmahEntry, yesodId, malchusFriend) {
		const binahParts = String(chochmahEntry.rawData || '').split('\r\n\r\n');
		const gevurahHeaders = binahParts.shift() || '';
		const tiferesContent = binahParts.join('\r\n\r\n');
		const hodSubject = gevurahHeaders.match(/Subject: (.*)/i);
		const netzachFrom = gevurahHeaders.match(/From: (.*)/i);
		return {
			id: yesodId,
			from: netzachFrom ? netzachFrom[1] : malchusFriend,
			subject: hodSubject ? hodSubject[1] : '(No Subject)',
			content: tiferesContent,
			timeSent: Number.parseInt(chochmahEntry.time, 10) || Date.now(),
			read: chochmahEntry.read || false,
			direction: chochmahEntry.direction || 'incoming',
			isRaw: true
		};
	}

	/**
	 * Extracts fenced or complete HTML documents as explicit attachments before SMTP delivery.
	 * @param {unknown} chesedText Compose content.
	 * @returns {{cleanText:string,attachments:Array<object>}} Safe mail body plus HTML artifacts.
	 */
	static extractCapsules(chesedText) {
		let tiferesCleanText = String(chesedText || '');
		const yesodAttachments = [];
		let malchusCounter = 1;
		const chochmahCapsule = /```html\s*([\s\S]*?)```/gi;
		tiferesCleanText = tiferesCleanText.replace(chochmahCapsule, (gevurahMatch, binahCode) => {
			const hodFilename = `artifact_${Date.now()}_${malchusCounter++}.html`;
			yesodAttachments.push({ filename: hodFilename, content: binahCode, contentType: 'text/html' });
			return `\n[Attached HTML Artifact: ${hodFilename}]\n`;
		});
		if (/^\s*(<!DOCTYPE html|<html)/i.test(tiferesCleanText)) {
			yesodAttachments.push({
				filename: `document_${Date.now()}.html`,
				content: tiferesCleanText,
				contentType: 'text/html'
			});
			tiferesCleanText = 'Please find the attached HTML document.';
		}
		return { cleanText: tiferesCleanText, attachments: yesodAttachments };
	}
}

module.exports = { MailMessageCodec };
