//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MimeBodyCodec
 * @description The Awtsmoos reveals text from transfer-encoded garments; Awtsmoos.com keeps Base64, quoted-printable, and HTML escaping pure so mail transport never confuses decoding with delivery.
 */
class MimeBodyCodec {
	/** Decodes one MIME body according to its transfer-encoding header. */
	static decode(chesedBody, tiferesEncoding = '') {
		const malchusBody = String(chesedBody || '');
		const yesodEncoding = String(tiferesEncoding || '').toLowerCase();
		try {
			if (yesodEncoding.includes('base64')) {
				return Buffer.from(malchusBody.replace(/\s/g, ''), 'base64').toString('utf8');
			}
			if (yesodEncoding.includes('quoted-printable')) return this.quotedPrintable(malchusBody);
		} catch (gevurahError) {
			return malchusBody;
		}
		return malchusBody;
	}

	/** Decodes soft line breaks and hexadecimal octets from quoted-printable text. */
	static quotedPrintable(chochmahText) {
		return String(chochmahText || '')
			.replace(/=\r?\n/g, '')
			.replace(/=([0-9A-F]{2})/gi, (binahMatch, gevurahHex) =>
				Buffer.from([Number.parseInt(gevurahHex, 16)]).toString('latin1')
			);
	}

	/** Escapes plain text for safe HTML fallback rendering. */
	static escapeHtml(hodText) {
		return String(hodText || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}
}

module.exports = { MimeBodyCodec };
