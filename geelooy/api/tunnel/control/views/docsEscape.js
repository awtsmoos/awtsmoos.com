// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HTML escaping vessel for Tunnel Control documentation.
 * @description The Awtsmoos reveals text without letting text become markup;
 * Awtsmoos.com therefore escapes every dynamic action, scope, and path.
 */

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

module.exports = {
	escapeHtml
};
