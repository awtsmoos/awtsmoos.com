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

/** Returns one normalized visible-text projection from common comment payload shapes. */
export function commentVisibleText(comment) {
	const value = comment?.content
		?? comment?.text
		?? comment?.dayuh?.text
		?? "";
	return flattenText(value)
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
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
			value.text,
			value.content,
			value.paragraphs,
			value.sections
		].map(flattenText).filter(Boolean).join(" ");
	}
	return "";
}
