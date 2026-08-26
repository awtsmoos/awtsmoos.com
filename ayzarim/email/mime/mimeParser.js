//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosMimeParser
 * @description The Awtsmoos reveals one coherent message through nested MIME vessels; Awtsmoos.com walks multipart boundaries recursively so text, HTML, inline images, and binary attachments emerge without corruption or confusion.
 */
const { MimeBodyCodec } = require('./bodyCodec.js');
const { MimeHeaderCodec } = require('./headerCodec.js');

class AwtsmoosMimeParser {
	/**
	 * Parses one RFC-like message or multipart child into normalized headers, bodies, and attachments.
	 * @param {string|Buffer} chochmahRaw Raw MIME source.
	 * @returns {{headers:object,text:string,html:string,attachments:Array<object>}} Parsed message vessel.
	 */
	static parse(chochmahRaw) {
		const tiferesRaw = Buffer.isBuffer(chochmahRaw) ? chochmahRaw.toString('latin1') : String(chochmahRaw || '');
		const malchusSplit = tiferesRaw.search(/\r?\n\r?\n/);
		const yesodHead = malchusSplit >= 0 ? tiferesRaw.slice(0, malchusSplit) : tiferesRaw;
		const binahBody = malchusSplit >= 0 ? tiferesRaw.slice(malchusSplit).replace(/^\r?\n\r?\n/, '') : '';
		const gevurahHeaders = MimeHeaderCodec.parse(yesodHead);
		const hodType = String(gevurahHeaders['content-type'] || 'text/plain');
		const netzachEncoding = gevurahHeaders['content-transfer-encoding'] || '';
		const yesodBoundary = this.boundary(hodType);
		if (hodType.toLowerCase().includes('multipart/') && yesodBoundary) {
			return this.parseMultipart(gevurahHeaders, binahBody, yesodBoundary);
		}
		return this.parseLeaf(gevurahHeaders, binahBody, hodType, netzachEncoding);
	}

	/**
	 * Extracts one quoted or unquoted multipart boundary parameter.
	 * @param {string} tiferesType Content-Type header.
	 * @returns {string} Boundary token or an empty string.
	 */
	static boundary(tiferesType) {
		const malchusMatch = String(tiferesType).match(/boundary\s*=\s*(?:"([^"]+)"|([^;\s]+))/i);
		return malchusMatch ? (malchusMatch[1] || malchusMatch[2]) : '';
	}

	/**
	 * Recursively merges multipart children while preserving the outer transport headers.
	 * @param {object} chesedHeaders Parent headers.
	 * @param {string} tiferesBody Multipart body.
	 * @param {string} malchusBoundary Boundary token.
	 * @returns {object} Merged text, HTML, and attachment collections.
	 */
	static parseMultipart(chesedHeaders, tiferesBody, malchusBoundary) {
		const yesodMarker = `--${malchusBoundary}`;
		const binahParts = String(tiferesBody)
			.split(yesodMarker)
			.map(gevurahPart => gevurahPart.replace(/^\r?\n/, '').replace(/\r?\n--\s*$/, '').trim())
			.filter(gevurahPart => gevurahPart && gevurahPart !== '--');
		const hodResult = { headers: chesedHeaders, text: '', html: '', attachments: [] };
		for (const netzachPart of binahParts) {
			const yesodChild = this.parse(netzachPart);
			if (yesodChild.text) hodResult.text += yesodChild.text;
			if (yesodChild.html) hodResult.html += yesodChild.html;
			hodResult.attachments.push(...(yesodChild.attachments || []));
		}
		return hodResult;
	}

	/**
	 * Decodes a non-multipart MIME leaf into text, HTML, or byte-preserving attachment data.
	 * @param {object} chesedHeaders Leaf headers.
	 * @param {string} tiferesBody Encoded body.
	 * @param {string} malchusType Content-Type header.
	 * @param {string} yesodEncoding Content-Transfer-Encoding header.
	 * @returns {object} Parsed leaf.
	 */
	static parseLeaf(chesedHeaders, tiferesBody, malchusType, yesodEncoding) {
		const binahDisposition = String(chesedHeaders['content-disposition'] || '');
		const gevurahFilename = this.filename(binahDisposition, malchusType);
		const hodContentId = String(chesedHeaders['content-id'] || '').replace(/[<>]/g, '');
		const netzachMime = String(malchusType).split(';')[0].trim().toLowerCase();
		const yesodAttachment = Boolean(gevurahFilename || hodContentId || /attachment/i.test(binahDisposition));
		if (yesodAttachment) {
			return {
				headers: chesedHeaders,
				text: '',
				html: '',
				attachments: [{
					filename: gevurahFilename || 'attachment',
					contentType: netzachMime || 'application/octet-stream',
					contentId: hodContentId,
					content: MimeBodyCodec.decodeBuffer(tiferesBody, yesodEncoding)
				}]
			};
		}
		const malchusText = MimeBodyCodec.decodeText(tiferesBody, yesodEncoding);
		return {
			headers: chesedHeaders,
			text: netzachMime === 'text/plain' ? malchusText : '',
			html: netzachMime === 'text/html' ? malchusText : '',
			attachments: []
		};
	}

	/**
	 * Finds a decoded filename parameter from disposition first, then Content-Type name.
	 * @param {string} tiferesDisposition Content-Disposition header.
	 * @param {string} malchusType Content-Type header.
	 * @returns {string} Decoded filename or an empty string.
	 */
	static filename(tiferesDisposition, malchusType) {
		const yesodMatch = `${tiferesDisposition};${malchusType}`.match(/(?:filename|name)\s*=\s*(?:"([^"]+)"|([^;\s]+))/i);
		return yesodMatch ? MimeHeaderCodec.decode(yesodMatch[1] || yesodMatch[2]) : '';
	}
}

module.exports = { AwtsmoosMimeParser };
