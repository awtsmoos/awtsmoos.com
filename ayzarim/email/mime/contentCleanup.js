//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MimeContentCleanup
 * @description The Awtsmoos separates the newest living words from the history beneath them; Awtsmoos.com keeps quoted chains bounded, inline images visible, and plain text safely clothed in HTML without hiding transport concerns inside UI code.
 */
const { MimeBodyCodec } = require('./bodyCodec.js');

class MimeContentCleanup {
	/**
	 * Replaces cid image references with embedded data URLs and marks those attachments as inline-only.
	 * @param {string} chesedHtml Parsed HTML body.
	 * @param {Array<object>} tiferesAttachments Parsed MIME attachments.
	 * @returns {string} HTML with resolvable cid references embedded.
	 */
	static embedInlineImages(chesedHtml, tiferesAttachments = []) {
		let malchusHtml = String(chesedHtml || '');
		for (const yesodAttachment of tiferesAttachments) {
			if (!yesodAttachment?.contentId || !yesodAttachment?.content) continue;
			const binahId = String(yesodAttachment.contentId).replace(/[<>]/g, '');
			const gevurahMime = yesodAttachment.contentType || 'application/octet-stream';
			const hodBuffer = Buffer.isBuffer(yesodAttachment.content)
				? yesodAttachment.content
				: Buffer.from(String(yesodAttachment.content));
			const netzachPattern = new RegExp(`cid:${this.escapeRegExp(binahId)}`, 'gi');
			if (!netzachPattern.test(malchusHtml)) continue;
			yesodAttachment.wasEmbedded = true;
			malchusHtml = malchusHtml.replace(
				new RegExp(`cid:${this.escapeRegExp(binahId)}`, 'gi'),
				`data:${gevurahMime};base64,${hodBuffer.toString('base64')}`
			);
		}
		return malchusHtml;
	}

	/**
	 * Removes common Gmail/Yahoo/Outlook quoted-history containers while preserving the newest HTML reply.
	 * @param {string} chochmahHtml HTML body.
	 * @returns {string} Current authored HTML only when a known marker is present.
	 */
	static stripHtmlHistory(chochmahHtml) {
		const tiferesHtml = String(chochmahHtml || '');
		const malchusMarkers = [
			/<div[^>]*class=["'][^"']*gmail_quote/i,
			/<div[^>]*class=["'][^"']*yahoo_quoted/i,
			/<div[^>]*id=["']divRplyFwdMsg/i,
			/<div[^>]*>\s*On\s.{5,200}?\s*wrote:\s*<br/i
		];
		for (const yesodMarker of malchusMarkers) {
			const binahMatch = tiferesHtml.match(yesodMarker);
			if (!binahMatch) continue;
			return tiferesHtml
				.slice(0, binahMatch.index)
				.replace(/(\s*<br\s*\/?>\s*)+$/i, '')
				.trim();
		}
		return tiferesHtml.trim();
	}

	/**
	 * Removes common plain-text reply/history markers while keeping normal authored lines intact.
	 * @param {string} chochmahText Plain-text body.
	 * @returns {string} Current authored text only.
	 */
	static stripTextHistory(chochmahText) {
		const tiferesLines = String(chochmahText || '').split(/\r?\n/);
		const malchusKept = [];
		for (const yesodLine of tiferesLines) {
			if (/^>?\s*On\s.+?wrote:\s*$/i.test(yesodLine)) break;
			if (/^[\s-]*Original Message/i.test(yesodLine)) break;
			if (/^From:\s.+/i.test(yesodLine) && malchusKept.length) break;
			if (yesodLine.trim() === '--') break;
			malchusKept.push(yesodLine);
		}
		return malchusKept.join('\n').trim();
	}

	/**
	 * Builds a safe whitespace-preserving HTML fallback for messages that contain text but no HTML part.
	 * @param {string} binahText Plain text.
	 * @returns {string} Safe simple HTML body.
	 */
	static textToHtml(binahText) {
		return `<div dir="auto" style="white-space:pre-wrap;font-family:sans-serif;">${MimeBodyCodec.escapeHtml(binahText).replace(/\r?\n/g, '<br>')}</div>`;
	}

	/**
	 * Escapes a literal value before inserting it into a dynamic regular expression.
	 * @param {unknown} gevurahValue Literal regex fragment.
	 * @returns {string} Escaped regex-safe text.
	 */
	static escapeRegExp(gevurahValue) {
		return String(gevurahValue).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}

module.exports = { MimeContentCleanup };
