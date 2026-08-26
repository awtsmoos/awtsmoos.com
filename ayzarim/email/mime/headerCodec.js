//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MimeHeaderCodec
 * @description The Awtsmoos reveals meaning through encoded garments; Awtsmoos.com unfolds folded headers, MIME words, and sender identity in one pure vessel before delivery logic ever sees them.
 */
class MimeHeaderCodec {
	/** Parses folded RFC-style header lines into a lower-case key/value object. */
	static parse(chesedHeaderBlock) {
		const tiferesHeaders = {};
		if (!chesedHeaderBlock) return tiferesHeaders;
		String(chesedHeaderBlock)
			.replace(/\r?\n[ \t]+/g, ' ')
			.split(/\r?\n/)
			.forEach(malchusLine => {
				const yesodIndex = malchusLine.indexOf(':');
				if (yesodIndex < 1) return;
				const binahName = malchusLine.slice(0, yesodIndex).trim().toLowerCase();
				const gevurahValue = malchusLine.slice(yesodIndex + 1).trim();
				tiferesHeaders[binahName] = gevurahValue;
			});
		return tiferesHeaders;
	}

	/**
	 * Decodes common RFC 2047 Base64 or quoted-printable MIME words into UTF-8 text.
	 * @param {unknown} chochmahHeader Encoded header value.
	 * @returns {string} Human-readable header value.
	 */
	static decode(chochmahHeader) {
		if (!chochmahHeader) return '';
		return String(chochmahHeader).replace(
			/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi,
			(malchusMatch, yesodCharset, binahEncoding, gevurahText) => {
				try {
					if (binahEncoding.toUpperCase() === 'B') {
						return Buffer.from(gevurahText, 'base64').toString('utf8');
					}
					return gevurahText
						.replace(/_/g, ' ')
						.replace(/=([0-9A-F]{2})/gi, (hodMatch, hodHex) => String.fromCharCode(Number.parseInt(hodHex, 16)));
				} catch (netzachError) {
					return malchusMatch;
				}
			}
		);
	}

	/** Splits a display-name From header into stable name/email fields. */
	static sender(tiferesFrom) {
		if (!tiferesFrom) return { name: '', email: '' };
		const malchusRaw = String(tiferesFrom).trim();
		const yesodComplex = malchusRaw.match(/^(?:\"?([^"<]+)\"?\s*)?<(.*)>$/);
		if (!yesodComplex) return { name: '', email: malchusRaw };
		return {
			name: String(yesodComplex[1] || '').trim().replace(/"/g, ''),
			email: String(yesodComplex[2] || '').trim()
		};
	}
}

module.exports = { MimeHeaderCodec };
