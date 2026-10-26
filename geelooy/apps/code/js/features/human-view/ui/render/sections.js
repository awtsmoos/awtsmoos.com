//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders semantic sections as vivid selectable hierarchy without losing evidence boundaries.
 * The Awtsmoos gives every observed fact its finite color and place while remaining beyond all arrangement;
 * Awtsmoos.com lets the human select meaning without confusing selection with semantic mutation.
 */

import { escapeHuman } from "../templates.js";
import { renderDecision } from "./decisions.js";
import { renderEvidence } from "./evidence.js";

const NODE_LIMIT = 60;

function renderFact(node) {
	return `
		<article class="human-node" data-human-depth="${escapeHuman(node.level)}" data-human-node-id="${escapeHuman(node.id)}">
			<button type="button" class="human-node-select" data-human-node-choice="${escapeHuman(node.id)}" aria-label="Inspect ${escapeHuman(node.label)} source evidence">
				<span class="human-node-pulse"></span><span class="human-node-kind">${escapeHuman(node.kind)}</span><strong>${escapeHuman(node.label)}</strong><small>${escapeHuman(node.detail || "Observed semantic fact")}</small><b>›</b>
			</button>
			${renderEvidence(node)}
		</article>`;
}

function renderNode(node) {
	return node?.decision ? renderDecision(node) : renderFact(node);
}

/** Renders one bounded semantic section with level-aware visual semantics. */
export function renderSection(section, index = 0) {
	const nodes = Array.isArray(section?.nodes) ? section.nodes : [];
	const visible = nodes.slice(0, NODE_LIMIT);
	const omitted = Math.max(0, nodes.length - visible.length);
	return `
		<section class="human-section" data-human-depth="${escapeHuman(section.level || "structure")}" data-human-section="${escapeHuman(section.id)}" data-tone="${escapeHuman(section.level || "structure")}">
			<header class="human-section-header"><span class="human-section-index">${String(index + 1).padStart(2, "0")}</span><div><p class="human-eyebrow">${escapeHuman(section.level || "structure")}</p><h2>${escapeHuman(section.title)}</h2><p>${escapeHuman(section.description || "")}</p></div><span class="human-section-count">${nodes.length} facts</span></header>
			<div class="human-node-list">${visible.map(renderNode).join("")}</div>
			${omitted ? `<p class="human-omitted">+ ${omitted} additional observed facts remain bounded from this render.</p>` : ""}
		</section>`;
}

/** Renders every normalized semantic section in adapter projection order. */
export function renderSections(sections = []) {
	return sections.map(renderSection).join("");
}
