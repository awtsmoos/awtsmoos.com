//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicHtmlSeoDocument.js
 * @description Reads authored discovery signals before generated light enters the head.
 * The Awtsmoos is beyond title and tag, yet Awtsmoos.com lets each truthful vessel sing;
 * what the page already knows remains, while missing meaning receives a careful wing.
 */

/** Decodes the small entity vocabulary used by authored title text. */
function decodeEntities(value) {
	return String(value || "")
		.replace(/&quot;/gi, '"')
		.replace(/&(?:apos|#39);/gi, "'")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&amp;/gi, "&");
}

/** Reads one attribute from a tag without depending on attribute order. */
function attributeValue(tag, name) {
	const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(`\\b${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
	const match = String(tag || "").match(pattern);
	return match ? (match[1] ?? match[2] ?? match[3] ?? "") : "";
}

/** Reads authored meta content selected by a name or property attribute. */
function selectedMetaContent(html, selector, value) {
	for (const match of String(html || "").matchAll(/<meta\b[^>]*>/gi)) {
		if (attributeValue(match[0], selector).toLowerCase() === value.toLowerCase()) {
			return decodeEntities(attributeValue(match[0], "content")).trim();
		}
	}
	return "";
}

/** Resolves the existing document title before generated fallback copy. */
function documentTitle(html, fallback = "") {
	const match = String(html || "").match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
	if (!match) {
		return fallback;
	}
	const title = decodeEntities(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
	return title || fallback;
}

/** Reads authored meta content by name. */
function metaContent(html, name) {
	return selectedMetaContent(html, "name", name);
}

/** Reads an authored canonical href when one exists. */
function canonicalHref(html) {
	for (const match of String(html || "").matchAll(/<link\b[^>]*>/gi)) {
		const relations = attributeValue(match[0], "rel").toLowerCase().split(/\s+/);
		if (relations.includes("canonical")) {
			return decodeEntities(attributeValue(match[0], "href")).trim();
		}
	}
	return "";
}

/** Reports whether a named meta element already exists. */
function hasNamedMeta(html, name) {
	return selectedMetaContent(html, "name", name) !== ""
		|| new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "i").test(html);
}

/** Reports whether an Open Graph-style property meta already exists. */
function hasPropertyMeta(html, property) {
	return selectedMetaContent(html, "property", property) !== ""
		|| new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${property}["'])[^>]*>`, "i").test(html);
}

/** Reports whether an authored canonical relation already exists. */
function hasCanonical(html) {
	return canonicalHref(html) !== "";
}

/** Recognizes both legacy RDFa and current JSON-LD Awtsmoos markers. */
function hasStructuredData(html) {
	return /data-awtsmoos-public-(?:jsonld|rdfa)\b/i.test(String(html || ""));
}

/** Escapes text for generated HTML attributes and title markup. */
function escapeAttribute(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

module.exports = {
	canonicalHref,
	documentTitle,
	escapeAttribute,
	hasCanonical,
	hasNamedMeta,
	hasPropertyMeta,
	hasStructuredData,
	metaContent
};
