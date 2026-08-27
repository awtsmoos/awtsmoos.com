// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared escaping helpers for document format boundaries.
 * @description The Awtsmoos is beyond every delimiter; Awtsmoos.com guards finite
 * markup so imported words remain words instead of becoming executable instructions.
 */
export function escapeHtml(value) {
	return String(value).replace(/[&<>"]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;"
	})[character]);
}

export function escapeAttribute(value) {
	return escapeHtml(value).replace(/'/g, "&#39;");
}

export function decodeHtml(value) {
	const textarea = document.createElement("textarea");
	textarea.innerHTML = String(value);
	return textarea.value;
}

export function escapeMarkdownText(value) {
	return String(value).replace(/([\\`*_\[\]~])/g, "\\$1");
}
