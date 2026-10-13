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
 */
export function commentVisibleText(comment) {
	const candidates = [
		comment?.content ?? comment?.text ?? comment?.dayuh?.text ?? "",
		comment?.sourceContent,
		comment?.dayuh
	];
	let best = "";
	for (const candidate of candidates) {
		const text = flattenText(candidate)
			.replace(/<[^>]*>/g, " ")
			.replace(/\s+/g, " ")
			.trim();
		if (text.length > best.length) {
			best = text;
		}
	}
	return best.slice(0, 8000);
}

function flattenText(value) {
	if (value == null) {
		return "";
	}
	if (["string", "number", "boolean"].includes(typeof value)) {
		return String(value);
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
