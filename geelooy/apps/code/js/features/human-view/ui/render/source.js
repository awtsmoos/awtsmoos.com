//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders the exact-source descent surface for selected or indexed semantic evidence.
 * The Awtsmoos lets the human descend from glowing meaning to measured letters without losing provenance;
 * Awtsmoos.com keeps every snippet bounded, escaped, and tied to the parser that observed it.
 */

import { escapeHuman } from "../templates.js";
import { renderProvenance } from "./evidence.js";

const SOURCE_LIMIT = 16;
const SNIPPET_LIMIT = 360;

function sourceNodes(documentModel) {
	return (documentModel.sections || []).flatMap(section => section.nodes || []).filter(node => node.source);
}

function sourceAction(node) {
	if (!node?.source) return "";
	return `<button type="button" class="human-source-open" data-human-source-start="${node.source.start}" data-human-source-end="${node.source.end}">Open exact source <span>→</span></button>`;
}

function selectedDetail(node, documentModel) {
	if (!node) return "";
	const snippet = node.source?.original?.slice(0, SNIPPET_LIMIT) || "No exact source interval is attached to this semantic fact.";
	return `<section class="human-source-detail"><div class="human-source-detail-head"><div><p class="human-eyebrow">Selected semantic fact</p><h2>${escapeHuman(node.label)}</h2><p>${escapeHuman(node.detail)}</p></div>${renderProvenance(node)}</div><div class="human-source-meta"><span><small>Kind</small>${escapeHuman(node.kind)}</span><span><small>Line</small>${node.source?.line || "—"}</span><span><small>Parser</small>${escapeHuman(documentModel.provenance.parser)}</span><span><small>Revision</small>${escapeHuman(documentModel.sourceRevision || "live")}</span></div><pre class="human-source-snippet"><code>${escapeHuman(snippet)}</code></pre>${sourceAction(node)}</section>`;
}

function indexItem(node) {
	return `<button type="button" class="human-source-index-item" data-human-node-choice="${escapeHuman(node.id)}"><span>L${node.source.line}</span><div><strong>${escapeHuman(node.label)}</strong><small>${escapeHuman(node.kind)} · ${escapeHuman(node.source.original.slice(0, 84))}</small></div><b>›</b></button>`;
}

/** Renders selected provenance plus a bounded index of every exact source-linked semantic fact. */
export function renderSourceSurface(documentModel, selectedNode) {
	const nodes = sourceNodes(documentModel);
	const warnings = documentModel.warnings || [];
	return `
		<section class="human-source-surface">
			<header class="human-mode-hero" data-tone="source"><p class="human-eyebrow">Source Descent</p><h2>Every bright idea must return to exact letters.</h2><p>${escapeHuman(documentModel.provenance.adapter)} · ${escapeHuman(documentModel.provenance.parser)}</p></header>
			${selectedDetail(selectedNode, documentModel)}
			<section class="human-source-index"><div class="human-group-heading"><span>&lt;/&gt;</span><div><p>Linked Evidence</p><h3>${nodes.length} exact source interval${nodes.length === 1 ? "" : "s"}</h3></div></div><div>${nodes.slice(0, SOURCE_LIMIT).map(indexItem).join("")}</div>${nodes.length > SOURCE_LIMIT ? `<p>+ ${nodes.length - SOURCE_LIMIT} more source-linked facts remain indexed.</p>` : ""}</section>
			${warnings.length ? `<section class="human-source-warnings"><strong>${warnings.length} parser warning${warnings.length === 1 ? "" : "s"}</strong>${warnings.map(warning => `<p>${escapeHuman(warning)}</p>`).join("")}</section>` : ""}
		</section>`;
}
