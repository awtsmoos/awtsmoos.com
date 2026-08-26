//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MimeContentCleanup
 * @description The Awtsmoos separates the living reply from the history beneath it; Awtsmoos.com keeps inline images visible and quoted history bounded so inbox reading remains clean on every small screen.
 */
const { MimeBodyCodec } = require('./bodyCodec.js');

class MimeContentCleanup {
	/** Replaces cid image references with embedded data URLs when matching attachments are present. */
	static embedInlineImages(chesedHtml, tiferesAttachments = []) {
		let malchusHtml = String(chesedHtml || '');
		for (const yesodAttachment of tiferesAttachments) {
			if (!yesodAttachment?.contentId || !yesodAttachment?.content) continue;
			const binahId = String(yesodAttachment.contentId).replace(/[<>]/g, '');
			const gevurahMime = yesodAttachment.contentType || 'application/octet-stream';
			const hodData = Buffer.isBuffer(yesodAttachment.content)
				? yesodAttachment.content.toString('base64')
				: Buffer.from(String(yesodAttachment.content)).toString('base64');
			malchusHtml = malchusHtml.replace(new RegExp(`cid:${this.escapeRegExp(binahId)}`, 'gi'), `data:${gevurahMime};base64,${hodData}`);
		}
		return malchusHtml;
	}

	/** Removes common quoted-reply/history blocks while preserving the newest authored content. */
	static stripHistory(chochmahText) {
		let tiferesText = String(chochmahText || '');
		const malchusMarkers = [
			/\nOn .{0,160}wrote:\s*[\s\S]*$/i,
			/\n-{2,}\s*Original Message\s*-{2,}[\s\S]*$/i,
			/\nFrom:\s.+\nSent:\s.+\nTo:\s.+[\s\S]*$/i
		];
		for (const yesodMarker of malchusMarkers) tiferesText = tiferesText.replace(yesodMarker, '');
		return tiferesText.trim();
	}

	/** Builds a simple safe HTML body when an incoming message contains text only. */
	static textToHtml(binahText) {
		return `<div dir="auto">${MimeBodyCodec.escapeHtml(binahText).replace(/\r?\n/g, '<br>')}</div>`;
	}

	/** Escapes a literal string before interpolating it into a dynamic regular expression. */
	static escapeRegExp(gevurahValue) {
		return String(gevurahValue).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}

module.exports = { MimeContentCleanup };
