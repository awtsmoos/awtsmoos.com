//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Projects one active-file semantic document as a bounded luminous constellation.
 * The Awtsmoos binds no imaginary edge merely because colored lines are beautiful;
 * Awtsmoos.com connects only the file to sections that its adapters actually observed.
 */

import { escapeHuman } from "../templates.js";

const SECTION_LIMIT = 8;
const FACT_LIMIT = 3;

function sectionTone(section) {
	return ["meaning", "structure", "behavior", "source"].includes(section?.level) ? section.level : "structure";
}

function factChip(node) {
	const sourceMark = node.source ? `L${node.source.line}` : "Observed";
	return `<button type="button" class="human-map-fact" data-human-node-choice="${escapeHuman(node.id)}"><span>${escapeHuman(node.kind)}</span><strong>${escapeHuman(node.label)}</strong><small>${escapeHuman(sourceMark)}</small></button>`;
}

function sectionNode(section) {
	const nodes = Array.isArray(section.nodes) ? section.nodes : [];
	const editable = nodes.filter(node => node.decision).length;
	const visible = nodes.slice(0, FACT_LIMIT);
	return `
		<article class="human-map-section" data-tone="${sectionTone(section)}">
			<div class="human-map-section-head"><span class="human-map-node-dot"></span><div><p>${escapeHuman(section.level || "structure")}</p><h3>${escapeHuman(section.title)}</h3></div><span class="human-map-count">${nodes.length}${editable ? ` · ${editable} editable` : ""}</span></div>
			<div class="human-map-facts">${visible.map(factChip).join("")}</div>
			${nodes.length > visible.length ? `<small class="human-map-more">+ ${nodes.length - visible.length} more observed facts</small>` : ""}
		</article>`;
}

/** Renders an honest active-file semantic map using only normalized document relationships. */
export function renderSemanticMap(documentModel) {
	const sections = (documentModel.sections || []).slice(0, SECTION_LIMIT);
	const totalFacts = (documentModel.sections || []).reduce((sum, section) => sum + (section.nodes?.length || 0), 0);
	return `
		<section class="human-map-surface">
			<header class="human-mode-hero"><p class="human-eyebrow">Semantic Map</p><h2>Observed relationships, not guessed architecture.</h2><p>The active file is the center. Every surrounding node comes from a real semantic section emitted by its adapter.</p></header>
			<div class="human-map-root"><span class="human-map-orbit"></span><p>${escapeHuman(documentModel.language)}</p><h2>${escapeHuman(documentModel.identity.name)}</h2><span>${sections.length} sections · ${totalFacts} facts</span></div>
			<div class="human-map-grid">${sections.map(sectionNode).join("")}</div>
			${(documentModel.sections || []).length > sections.length ? `<p class="human-map-overflow">+ ${(documentModel.sections || []).length - sections.length} additional sections remain available in Document mode.</p>` : ""}
		</section>`;
}
