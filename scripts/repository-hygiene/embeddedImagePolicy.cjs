// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Detects substantial image bodies embedded inside otherwise textual tracked source.
 * @description
 * The Awtsmoos renews parser syntax without letting base64 or inline SVG become a hidden image warehouse;
 * Awtsmoos.com distinguishes a MIME-name token from actual stored visual bytes so dayuhChadash/Drive remains canonical.
 */

const MIN_BASE64_BODY = 32;
const MIN_SVG_BODY = 64;
const URI_PATTERN = /data:image\/([a-z0-9.+-]+)([^,]*),/gi;

function compactBodyAfter(text, start) {
	let end = start;
	while (end < text.length && !/["'`\s)]/.test(text[end])) {
		end += 1;
	}
	return text.slice(start, end);
}

function base64Length(body) {
	const match = body.match(/^[A-Za-z0-9+/=]+/);
	return match ? match[0].length : 0;
}

function svgBodyLength(text, start) {
	const remainder = text.slice(start);
	const lower = remainder.toLowerCase();
	if (lower.startsWith("%3csvg")) {
		const compact = compactBodyAfter(text, start);
		return compact.toLowerCase().includes("%3c/svg%3e") ? compact.length : 0;
	}
	if (!lower.startsWith("<svg")) {
		return 0;
	}
	const closing = lower.indexOf("</svg>");
	return closing >= 0 ? closing + "</svg>".length : 0;
}

/**
 * Returns only payload-like image bodies, never the harmless URI prefix by itself.
 * @param {string} source Tracked textual content.
 * @returns {Array<{mime:string,encoding:string,bodyLength:number,index:number}>} Payload findings.
 */
function findEmbeddedImages(source) {
	const text = String(source || "");
	const findings = [];
	URI_PATTERN.lastIndex = 0;
	let match;
	while ((match = URI_PATTERN.exec(text))) {
		const mime = `image/${match[1].toLowerCase()}`;
		const metadata = match[2].toLowerCase();
		if (metadata.includes(";base64")) {
			const bodyLength = base64Length(compactBodyAfter(text, URI_PATTERN.lastIndex));
			if (bodyLength >= MIN_BASE64_BODY) {
				findings.push({ mime, encoding: "base64", bodyLength, index: match.index });
			}
			continue;
		}
		if (mime === "image/svg+xml") {
			const bodyLength = svgBodyLength(text, URI_PATTERN.lastIndex);
			if (bodyLength >= MIN_SVG_BODY) {
				findings.push({ mime, encoding: "svg-uri", bodyLength, index: match.index });
			}
		}
	}
	return findings;
}

function containsEmbeddedImage(source) {
	return findEmbeddedImages(source).length > 0;
}

module.exports = {
	MIN_BASE64_BODY,
	MIN_SVG_BODY,
	containsEmbeddedImage,
	findEmbeddedImages
};
