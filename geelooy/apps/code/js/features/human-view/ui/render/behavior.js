//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders deterministic semantic choices as a mobile-first Behavior Studio.
 * The Awtsmoos grants choice only where the source contract is truly known;
 * Awtsmoos.com therefore makes editable Decisions luminous and observed behavior explicitly read-only.
 */

import { escapeHuman } from "../templates.js";
import { renderDecision } from "./decisions.js";
import { renderEvidence } from "./evidence.js";

function allNodes(documentModel) {
	return (documentModel.sections || []).flatMap(section => section.nodes || []);
}

function readOnlyBehavior(node) {
	return `<article class="human-behavior-observation" data-human-node-id="${escapeHuman(node.id)}"><div><span>${escapeHuman(node.kind)}</span><h3>${escapeHuman(node.label)}</h3><p>${escapeHuman(node.detail || "Observed behavior evidence")}</p></div>${renderEvidence(node)}</article>`;
}

/** Renders real executable decisions before non-editable behavior evidence. */
export function renderBehaviorStudio(documentModel) {
	const nodes = allNodes(documentModel);
	const decisions = nodes.filter(node => node.decision);
	const observed = nodes.filter(node => !node.decision && node.level === "behavior").slice(0, 18);
	return `
		<section class="human-behavior-studio">
			<header class="human-mode-hero" data-tone="behavior"><p class="human-eyebrow">Behavior Studio</p><h2>Edit only what the source contract can prove.</h2><p>Amber controls are deterministic materializers. Everything else remains observed evidence until a real compiler path exists.</p></header>
			<div class="human-device-context" aria-label="Responsive context"><span>Context</span><strong>Desktop</strong><strong>Tablet</strong><strong>Mobile</strong></div>
			<section class="human-behavior-group"><div class="human-group-heading"><span>01</span><div><p>Executable Decisions</p><h3>${decisions.length} deterministic choice${decisions.length === 1 ? "" : "s"}</h3></div></div>${decisions.length ? `<div class="human-decision-list">${decisions.map(renderDecision).join("")}</div>` : `<div class="human-behavior-empty"><strong>No deterministic decisions yet.</strong><p>This file can still be understood semantically; Human Takeover will not invent controls it cannot safely materialize.</p></div>`}</section>
			<section class="human-behavior-group"><div class="human-group-heading"><span>02</span><div><p>Observed Behavior</p><h3>Read-only evidence</h3></div></div>${observed.length ? `<div class="human-behavior-observations">${observed.map(readOnlyBehavior).join("")}</div>` : `<p class="human-behavior-empty">No additional behavior-level facts were emitted by this adapter.</p>`}</section>
		</section>`;
}
