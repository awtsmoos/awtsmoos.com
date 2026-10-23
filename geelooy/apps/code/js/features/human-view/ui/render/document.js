//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders one semantic document as readable architecture rather than generated code.
 * The Awtsmoos gives meaning, evidence, and unresolved mystery distinct finite garments;
 * Awtsmoos.com lets the human see what is known without making uncertainty impersonate knowledge.
 */

import { escapeHuman } from "../templates.js";
import { renderSections } from "./sections.js";

function metric(label, value, tone) {
	return `<div class="human-metric" data-tone="${tone}"><strong>${value}</strong><span>${label}</span></div>`;
}

function renderWarnings(warnings = []) {
	if (!warnings.length) return "";
	return `
		<section class="human-warnings" data-human-depth="source">
			<p class="human-eyebrow">Warnings</p>
			<h2>Evidence that needs attention</h2>
			${warnings.map(warning => `<p>${escapeHuman(warning)}</p>`).join("")}
		</section>`;
}

/** Renders the source-independent Human Takeover document body. */
export function renderHumanDocument(documentModel) {
	const identity = documentModel.identity;
	const metrics = documentModel.metrics;
	return `
		<article class="human-takeover-document">
			<header class="human-document-hero" data-human-depth="meaning">
				<div>
					<p class="human-eyebrow">${escapeHuman(documentModel.language)} · ${escapeHuman(documentModel.provenance.adapter)}</p>
					<h1>${escapeHuman(identity.name)}</h1>
					<p class="human-path">${escapeHuman(identity.path)}</p>
				</div>
				<span class="human-observed-seal">Source-linked</span>
			</header>
			<section class="human-purpose" data-human-depth="meaning" data-status="${escapeHuman(documentModel.purpose.status)}">
				<p class="human-eyebrow">Purpose</p>
				<h2>${documentModel.purpose.status === "unresolved" ? "Meaning remains open" : "Established meaning"}</h2>
				<p>${escapeHuman(documentModel.purpose.text)}</p>
			</section>
			<section class="human-metrics" data-human-depth="meaning" aria-label="Takeover evidence status">
				${metric("Observed facts", metrics.observed, "observed")}
				${metric("Editable decisions", metrics.editable, "editable")}
				${metric("Warnings", metrics.warnings, "warning")}
				${metric("Unresolved meaning", metrics.unresolvedMeaning, "unresolved")}
			</section>
			${renderSections(documentModel.sections)}
			${renderWarnings(documentModel.warnings)}
			<footer class="human-document-footer" data-human-depth="source">
				<span>${escapeHuman(documentModel.provenance.parser)}</span>
				<span>Revision ${escapeHuman(documentModel.sourceRevision || "live")}</span>
			</footer>
		</article>`;
}
