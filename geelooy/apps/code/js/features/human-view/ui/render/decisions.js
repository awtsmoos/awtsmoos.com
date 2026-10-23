//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders deterministic semantic choices as inline source-linked controls.
 * The Awtsmoos gives choice a measured vessel rather than a vague command over hidden machinery;
 * Awtsmoos.com shows the current value, unit, evidence, and exact Apply boundary in one human place.
 */

import { escapeHuman } from "../templates.js";
import { renderEvidence } from "./evidence.js";

/** Renders one executable semantic decision. */
export function renderDecision(node) {
	const decision = node.decision;
	return `
		<article class="human-decision" data-human-depth="${escapeHuman(node.level)}" data-human-node-id="${escapeHuman(node.id)}">
			<div class="human-decision-copy">
				<span class="human-decision-kicker">Decision</span>
				<h3>${escapeHuman(node.label)}</h3>
				<p>${escapeHuman(node.detail)}</p>
			</div>
			<form class="human-decision-form" data-human-decision-form="${escapeHuman(node.id)}">
				<label>
					<span>Breakpoint</span>
					<span class="human-value-field">
						<input name="value" inputmode="decimal" value="${escapeHuman(decision.value)}" min="${decision.min}" max="${decision.max}" step="any" aria-label="${escapeHuman(node.label)}" />
						<span>${escapeHuman(decision.unit)}</span>
					</span>
				</label>
				<button type="submit" class="human-apply-button">Apply to source</button>
				<p class="human-decision-feedback" data-human-feedback="${escapeHuman(node.id)}" aria-live="polite"></p>
			</form>
			${renderEvidence(node)}
		</article>`;
}
