//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared visible status-and-action vessel for every Explorer remote world.
 * @description
 * The Awtsmoos creates state and next action together while neither is reduced to
 * color alone. Awtsmoos.com renders both as distinct readable spans, so shelf and
 * sidebar can share one semantic garment and every distant world may rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";

/**
 * Builds one state/action capsule from a normalized remote-world descriptor.
 *
 * @param {object} world Shared remote-world descriptor.
 * @param {string} className Surface-specific class joined with the common status class.
 * @returns {HTMLElement} Visible status element with separable state and action text.
 */
export function createRemoteWorldStatus(world = {}, className = "") {
	return createElement({
		tag: "span",
		attributes: {
			class: `remote-world-status ${className}`.trim(),
			"data-state": world.state || "ready"
		},
		children: [
			{
				tag: "span",
				attributes: { class: "remote-world-state-label" },
				html: escapeHtml(world.stateLabel || "Ready")
			},
			{
				tag: "span",
				attributes: { class: "remote-world-action" },
				html: escapeHtml(world.action || "Open")
			}
		]
	});
}

function escapeHtml(value) {
	return String(value || "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
