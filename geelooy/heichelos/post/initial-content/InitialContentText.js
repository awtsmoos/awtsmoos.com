//B"H
//Boruch Hashem
//Blessed be He

/**
	* @module InitialContentText
	* @description
	* The Awtsmoos keeps server-first Torah text readable without trusting incoming
	* markup. These helpers normalize legacy content, escape HTML, and recursively
	* recover human-readable text while ignoring storage metadata.
	*/

const HTML_ESCAPES = Object.freeze({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;"
});

const IGNORED_FIELDS = new Set([
	"id",
	"author",
	"aliasId",
	"timestamp",
	"createdAt",
	"updatedAt"
]);

/**
	* Escapes untrusted text for insertion into generated HTML.
	* @param {*} value Arbitrary source value.
	* @returns {string} HTML-safe text.
	*/
function escapeHtml(value) {
	return String(value == null ? "" : value).replace(/[&<>"']/g, character => {
		return HTML_ESCAPES[character];
	});
}

/**
	* Decodes only the common entities needed before plain-text normalization.
	* @param {*} value Arbitrary source value.
	* @returns {string} Partially decoded text.
	*/
function decodeCommonEntities(value) {
	return String(value || "")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;|&apos;/gi, "'");
}

/**
	* Converts legacy HTML-like content into calm readable plain text.
	* @param {*} value Arbitrary source value.
	* @returns {string} Normalized plain text.
	*/
function toPlainText(value) {
	return decodeCommonEntities(value == null ? "" : value)
		.replace(/<br[^>]*>/gi, "\n")
		.replace(/<\/(p|div|li|h[1-6]|blockquote|section|article)>/gi, "\n\n")
		.replace(/<[^>]*>/g, " ")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n[ \t]+/g, "\n")
		.replace(/[ \t]{2,}/g, " ")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

/**
	* Recovers readable text from strings, arrays, or legacy nested content maps.
	* @param {*} value Candidate content vessel.
	* @param {number} [depth=0] Current recursion depth.
	* @returns {string} Best readable text found within the vessel.
	*/
function collectReadableText(value, depth = 0) {
	if (value == null || depth > 5) {
		return "";
	}
	if (typeof value === "string" || typeof value === "number") {
		return toPlainText(value);
	}
	if (Array.isArray(value)) {
		return value.map(item => {
			return collectReadableText(item, depth + 1);
		}).filter(Boolean).join("\n\n");
	}
	if (typeof value !== "object") {
		return "";
	}
	for (const key of ["text", "content", "body", "paragraph", "html", "value", "description"]) {
		const preferredText = collectReadableText(value[key], depth + 1);
		if (preferredText) {
			return preferredText;
		}
	}
	return Object.keys(value).filter(key => {
		return !IGNORED_FIELDS.has(key);
	}).map(key => {
		return collectReadableText(value[key], depth + 1);
	}).filter(Boolean).join("\n\n");
}

module.exports = {
	collectReadableText,
	escapeHtml,
	toPlainText
};
