//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders the vivid semantic document surface from normalized observed evidence.
 * The Awtsmoos gives prose, confidence, metrics, and source-linked sections one luminous readable order;
 * Awtsmoos.com keeps unresolved purpose visibly unresolved while making the known architecture easy to inhabit.
 */

import { escapeHuman } from "../templates.js";
import { renderSections } from "./sections.js";

function metric(label, value, tone, glyph) {
	return `<div class="human-metric" data-tone="${tone}"><span class="human-metric-glyph">${glyph}</span><strong>${value}</strong><span>${label}</span></div>`;
}

function previewBand(documentModel) {
	const sourceLinked = documentModel.sections.flatMap(section => section.nodes || []).filter(node => node.source).length;
	const editable = documentModel.metrics.editable;
	return `<section class="human-semantic-preview" data-human-depth="meaning"><div><p class="human-eyebrow">Semantic Preview</p><h2>${escapeHuman(documentModel.language)} seen through human-scale evidence.</h2></div><div class="human-preview-pills"><span><b>${documentModel.sections.length}</b> semantic sections</span><span><b>${sourceLinked}</b> source-linked facts</span><span><b>${editable}</b> deterministic decisions</span></div></section>`;
}

function renderWarnings(warnings = []) {
	if (!warnings.length) return "";
	return `<section class="human-warnings" data-human-depth="source"><p class="human-eyebrow">Warnings</p><h2>Evidence that needs attention</h2>${warnings.map(warning => `<p>${escapeHuman(warning)}</p>`).join("")}</section>`;
}

/** Renders the default semantic document without inventing application purpose or runtime facts. */
export function renderHumanDocument(documentModel) {
	const identity = documentModel.identity;
	const metrics = documentModel.metrics;
	return `
		<article class="human-takeover-document">
			<header class="human-document-hero" data-human-depth="meaning"><div><p class="human-eyebrow">${escapeHuman(documentModel.language)} · ${escapeHuman(documentModel.provenance.adapter)}</p><h1>${escapeHuman(identity.name)}</h1><p class="human-path">${escapeHuman(identity.path)}</p></div><span class="human-observed-seal"><i></i> Source-linked</span></header>
			<section class="human-purpose" data-human-depth="meaning" data-status="${escapeHuman(documentModel.purpose.status)}"><div class="human-purpose-mark">◎</div><div><p class="human-eyebrow">Meaning</p><h2>${documentModel.purpose.status === "unresolved" ? "Meaning remains open" : "Established meaning"}</h2><p>${escapeHuman(documentModel.purpose.text)}</p></div></section>
			${previewBand(documentModel)}
			<section class="human-metrics" data-human-depth="meaning" aria-label="Takeover evidence status">${metric("Observed facts", metrics.observed, "structure", "⌘")}${metric("Editable decisions", metrics.editable, "behavior", "⚡")}${metric("Warnings", metrics.warnings, "source", "!")}${metric("Unresolved meaning", metrics.unresolvedMeaning, "meaning", "◎")}</section>
			<div class="human-section-stack">${renderSections(documentModel.sections)}</div>
			${renderWarnings(documentModel.warnings)}
			<footer class="human-document-footer" data-human-depth="source"><span>${escapeHuman(documentModel.provenance.parser)}</span><span>Revision ${escapeHuman(documentModel.sourceRevision || "live")}</span></footer>
		</article>`;
}
