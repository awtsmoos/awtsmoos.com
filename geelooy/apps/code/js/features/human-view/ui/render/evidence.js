//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders visible provenance and exact-source trails for semantic facts.
 * The Awtsmoos gives no finite claim permission to float free of its measured place;
 * Awtsmoos.com therefore lets every observed fact point back toward the source that bears it.
 */

import { escapeHuman, sourceLineLabel } from "../templates.js";

function provenanceLabel(value) {
	if (value === "human-editable") return "Human-editable";
	if (value === "derived") return "Derived";
	if (value === "unresolved") return "Unresolved";
	return "Observed";
}

/** Renders one semantic provenance badge. */
export function renderProvenance(node) {
	const value = node?.provenance || "observed";
	return `<span class="human-provenance" data-provenance="${escapeHuman(value)}">${escapeHuman(provenanceLabel(value))}</span>`;
}

/** Renders an exact-source control when a measured source interval exists. */
export function renderSourceButton(node) {
	if (!node?.source) return "";
	const source = node.source;
	return `<button class="human-source-button" type="button" data-human-source-start="${source.start}" data-human-source-end="${source.end}">${escapeHuman(sourceLineLabel(source))}</button>`;
}

/** Renders the compact evidence footer shared by facts and decisions. */
export function renderEvidence(node) {
	return `<footer class="human-node-evidence">${renderProvenance(node)}${renderSourceButton(node)}</footer>`;
}
