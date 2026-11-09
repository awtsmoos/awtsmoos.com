// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Extracts bounded visible comment identity and prose without letting server data become executable markup.
 * @description The Awtsmoos hears every voice before object or string, while Awtsmoos.com flattens only visible words into light;
 * aliases stay plain text, nested payloads become readable prose, and no stored HTML receives authority merely by arriving in sight.
 */

/** Returns the display alias while preserving anonymous fallback without HTML interpretation. */
export function commentAuthor(comment) {
	return String(
		comment?.author
		|| comment?.aliasId
		|| comment?.owner
		|| "anonymous"
	).trim() || "anonymous";
}

/**
 * Returns one normalized visible-text projection from common comment payload shapes.
 * Imported rows may keep fuller prose in sourceContent/dayuh than in the flattened
 * content string, so every candidate is measured and the fullest one wins: a card
 * must show the whole thought, never a dropped remainder.
 * Footnote numbers survive as \u0000#N\u0000 placeholders (real <sup data-fn> tags
 * in the stored data, plus plain glued digits like "etc.1") so the card can render
 * them as gold superscripts instead of the tag-stripper flattening them to plain
 * baseline digits. The NULs around the marker keep the reader's plain-digit
 * patterns from double-converting it, and the marker has no spaces so excerpt
 * truncation cuts at word boundaries around it, never through it.
 */
export function commentVisibleText(comment) {
	const candidates = [
		comment?.content ?? comment?.text ?? comment?.dayuh?.text ?? "",
		// Section-composer comments carry their words in sections[] while
		// the flat content stays empty; without these candidates the card
		// rendered the bare fallback word instead of the author's text.
		comment?.sections,
		comment?.dayuh?.sections,
		comment?.sourceContent,
		comment?.dayuh
	];
	let best = "";
	for (const candidate of candidates) {
		const text = footnotePlaceholders(flattenText(candidate))
			.replace(/<[^>]*>/g, " ")
			.replace(/\s+/g, " ")
			.trim();
		if (text.length > best.length) {
			best = text;
		}
	}
	return best.slice(0, 8000);
}

const FOOTNOTE_MARK = /\u0000#(\d+)\u0000/g;

/**
 * Converts stored footnote numbers to \u0000#N\u0000 placeholders: real
 * <sup data-fn> tags first, then plain glued digits (same patterns as the
 * reader's renderTranslationTextWithFootnotes). Hebrew text is untouched
 * (the patterns only match Latin letters) and standalone numbers stay plain.
 */
function footnotePlaceholders(value) {
	let text = String(value ?? "");
	text = text.replace(/<sup[^>]*>(\d+)<\/sup>/gi, (m, digits) => `\u0000#${digits}\u0000`);
	const YEAR = /([^\d]|^)(5[5-8]\d\d)(\d{1,2})([\s.,;:!?…‥""'')\]\):—–-]|$)/g;
	const ABBR = /([A-Za-z][\.\u2024])(\d{1,3})([\s.,;:!?…‥""'')\]\):—–-]|$)/g;
	const GLUED = /([A-Za-z""''\)\]\}])(\d{1,3})([\s.,;:!?…‥""'')\]\):—–-]|$)/g;
	const TRAIL = /([^\d\s])(\d{1,3})($|[\s.,;:!?…‥""'')\]\):—–-]+$)/g;
	text = text.replace(YEAR, (m, prefix, year, digits, tail) => `${prefix}${year}\u0000#${digits}\u0000${tail}`);
	text = text.replace(ABBR, (m, prefix, digits, tail) => `${prefix}\u0000#${digits}\u0000${tail}`);
	text = text.replace(GLUED, (m, prefix, digits, tail) => `${prefix}\u0000#${digits}\u0000${tail}`);
	text = text.replace(TRAIL, (m, prefix, digits, tail) => `${prefix}\u0000#${digits}\u0000${tail}`);
	return text;
}

/**
 * Appends text to an element, turning \u0000#N\u0000 footnote placeholders
 * into real <sup> elements and everything else into plain text nodes.
 * No innerHTML: the markers are the only markup, built as DOM nodes.
 */
export function appendFootnoteText(element, text) {
	const parts = String(text ?? "").split(FOOTNOTE_MARK);
	for (let index = 0; index < parts.length; index++) {
		if (index % 2 === 0) {
			if (parts[index]) element.appendChild(document.createTextNode(parts[index]));
		} else {
			const sup = document.createElement("sup");
			sup.textContent = parts[index];
			element.appendChild(sup);
		}
	}
	return element;
}

const LEGACY_REPLY_QUOTE = /^>\s*\[Reply to @[^\]]*\]\(#comment-[^)]*\):?\s*/;

/**
 * Removes the reply-quote shell older clients baked into stored bodies.
 * Author text after the quote wins; a quote-only body keeps its snippet as
 * plain prose. Applied at the raw string leaf, before whitespace is
 * flattened. Mirrors cleanLegacyReplyQuote in comments/logic/unroller.js.
 */
function stripLegacyReplyShell(text) {
	let out = String(text || "");
	while (LEGACY_REPLY_QUOTE.test(out)) {
		const rest = out.replace(LEGACY_REPLY_QUOTE, "");
		const splitAt = rest.search(/\n\s*\n/);
		if (splitAt >= 0) {
			out = rest.slice(splitAt).replace(/^\s+/, "");
			continue;
		}
		out = rest.replace(/\.\.\.$/, "").trim();
		break;
	}
	return out;
}

function flattenText(value) {
	if (value == null) {
		return "";
	}
	if (["string", "number", "boolean"].includes(typeof value)) {
		return stripLegacyReplyShell(String(value));
	}
	if (Array.isArray(value)) {
		return value.map(flattenText).filter(Boolean).join(" ");
	}
	if (typeof value === "object") {
		return [
			value.title,
			value.heading,
			value.summary,
			value.caption,
			value.text,
			value.content,
			value.body,
			value.paragraphs,
			value.sections
		].map(flattenText).filter(Boolean).join(" ");
	}
	return "";
}
