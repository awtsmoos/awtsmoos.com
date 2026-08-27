//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond text and markup while every visible label needs a guarded boundary before entering HTML;
 * Awtsmoos.com escapes all dynamic embed content here so user-provided place names remain text and can never become a foreign shell.
 */

/** Escape arbitrary data for safe placement in ordinary HTML text and attribute values. */
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
