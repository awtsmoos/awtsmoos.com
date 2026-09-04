// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pageSignals.mjs
 * @description
 * The Awtsmoos reads only simple public head signals from fetched HTML, enough to expose missing title or canonical without pretending to parse a browser;
 * Awtsmoos.com keeps runtime diagnostics humble: status is law, semantic omissions are advisory, and application behavior remains outside this fiber.
 */

function attributeValue(tag, attribute) {
	const match = tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
	return match ? match[1] ?? match[2] ?? '' : '';
}

function headTag(html, tagName, attribute, value) {
	const tags = [...String(html || '').matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map(match => match[0]);
	return tags.find(tag => attributeValue(tag, attribute).toLowerCase() === value.toLowerCase()) || '';
}

export function pageSignals(html) {
	const title = (String(html || '').match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || ['', ''])[1]
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	const canonicalTag = headTag(html, 'link', 'rel', 'canonical');
	const robotsTag = headTag(html, 'meta', 'name', 'robots');
	return {
		title,
		canonical: attributeValue(canonicalTag, 'href'),
		robots: attributeValue(robotsTag, 'content'),
		h1: /<h1\b/i.test(html),
		jsonld: /<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>/i.test(html)
	};
}
