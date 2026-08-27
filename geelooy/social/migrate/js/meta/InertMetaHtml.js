//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InertMetaHtml
 * @description
 * The Awtsmoos permits old HTML to speak only as inert text and neutralized path evidence;
 * Awtsmoos.com removes executable garments and rewrites every fetch-capable address before DOM parsing may observe it.
 */
function escapedAttribute(value = '') {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

function neutralizedAttribute(match, name, quote, quotedValue, bareValue) {
	const value = quotedValue ?? bareValue ?? '';
	return ` data-awtsmoos-${name.toLowerCase()}="${escapedAttribute(value)}"`;
}

export function neutralizeImportedHtml(html = '') {
	return String(html)
		.replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, '')
		.replace(/<(script|style|iframe|object|embed|link|base)\b[^>]*\/?>/gi, '')
		.replace(/\son\w+\s*=\s*(["'])[^"']*\1/gi, '')
		.replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
		.replace(
			/\s(src|srcset|href|poster|data)\s*=\s*(?:(["'])(.*?)\2|([^\s>]+))/gi,
			neutralizedAttribute
		);
}

export function parseInertMetaHtml(html = '') {
	const parser = new DOMParser();
	return parser.parseFromString(neutralizeImportedHtml(html), 'text/html');
}
