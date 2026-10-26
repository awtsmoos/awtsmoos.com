//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders source-guarded semantic Decisions as luminous human behavior controls.
 * The Awtsmoos gives human choice a clear amber vessel while exact source remains measured beneath it;
 * Awtsmoos.com preserves the original deterministic form contract so visual intensity never changes authority.
 */

import { escapeHuman } from "../templates.js";
import { renderEvidence } from "./evidence.js";

/** Renders one executable Decision using the materializer-compatible field contract. */
export function renderDecision(node) {
	const decision = node.decision;
	return `
		<article class="human-decision" data-human-depth="${escapeHuman(node.level)}" data-human-node-id="${escapeHuman(node.id)}">
			<div class="human-decision-copy">
				<span class="human-decision-kicker"><b>⚡</b> Deterministic Decision</span>
				<h3>${escapeHuman(node.label)}</h3>
				<p>${escapeHuman(node.detail)}</p>
			</div>
			<form class="human-decision-form" data-human-decision-form="${escapeHuman(node.id)}">
				<label><span>Breakpoint</span><span class="human-value-field"><input name="value" inputmode="decimal" value="${escapeHuman(decision.value)}" min="${decision.min}" max="${decision.max}" step="any" aria-label="${escapeHuman(node.label)}" /><span>${escapeHuman(decision.unit)}</span></span></label>
				<button type="submit" class="human-apply-button"><span>Apply</span><b>→</b></button>
				<p class="human-decision-feedback" data-human-feedback="${escapeHuman(node.id)}" aria-live="polite"></p>
			</form>
			<div class="human-decision-trail"><span>Human choice</span><i>→</i><span>Exact token</span><i>→</i><span>Editor input</span></div>
			${renderEvidence(node)}
		</article>`;
}
