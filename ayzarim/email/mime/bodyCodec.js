//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MimeBodyCodec
 * @description The Awtsmoos reveals letters and bytes through different garments; Awtsmoos.com keeps textual revelation UTF-8 clean while binary vessels remain intact for images, files, and forwarding light.
 */
class MimeBodyCodec {
	/**
	 * Decodes one transfer-encoded MIME body into human-readable UTF-8 text.
	 * @param {unknown} chesedBody Encoded MIME body.
	 * @param {string} [tiferesEncoding] Content-Transfer-Encoding header.
	 * @returns {string} Decoded text, falling back to the original body on malformed input.
	 */
	static decodeText(chesedBody, tiferesEncoding = '') {
		try {
			return this.decodeBuffer(chesedBody, tiferesEncoding).toString('utf8');
		} catch (gevurahError) {
			return String(chesedBody || '');
		}
	}

	/**
	 * Decodes one MIME body into bytes so binary attachments never pass through lossy string conversion.
	 * @param {unknown} chochmahBody Encoded MIME body.
	 * @param {string} [binahEncoding] Content-Transfer-Encoding header.
	 * @returns {Buffer} Decoded byte vessel.
	 */
	static decodeBuffer(chochmahBody, binahEncoding = '') {
		const malchusRaw = Buffer.isBuffer(chochmahBody)
			? chochmahBody.toString('latin1')
			: String(chochmahBody || '');
		const yesodEncoding = String(binahEncoding || '').trim().toLowerCase();
		if (yesodEncoding === 'base64') {
			return Buffer.from(malchusRaw.replace(/\s/g, ''), 'base64');
		}
		if (yesodEncoding === 'quoted-printable') {
			return this.quotedPrintableBuffer(malchusRaw);
		}
		return Buffer.from(malchusRaw, 'utf8');
	}

	/**
	 * Decodes quoted-printable soft breaks and hexadecimal octets into exact bytes.
	 * @param {string} tiferesText Quoted-printable source.
	 * @returns {Buffer} Decoded bytes.
	 */
	static quotedPrintableBuffer(tiferesText) {
		const malchusClean = String(tiferesText || '').replace(/=\r?\n/g, '');
		const yesodBytes = [];
		for (let binahIndex = 0; binahIndex < malchusClean.length; binahIndex++) {
			if (malchusClean[binahIndex] === '=') {
				const gevurahHex = malchusClean.slice(binahIndex + 1, binahIndex + 3);
				if (/^[0-9A-F]{2}$/i.test(gevurahHex)) {
					yesodBytes.push(Number.parseInt(gevurahHex, 16));
					binahIndex += 2;
					continue;
				}
			}
			yesodBytes.push(malchusClean.charCodeAt(binahIndex));
		}
		return Buffer.from(yesodBytes);
	}

	/**
	 * Escapes plain text before it is promoted into a safe HTML fallback body.
	 * @param {unknown} hodText Plain text.
	 * @returns {string} HTML-safe text.
	 */
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
