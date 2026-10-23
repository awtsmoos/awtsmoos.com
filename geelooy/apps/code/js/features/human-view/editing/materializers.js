//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Turns explicitly supported semantic decisions into one guarded source replacement.
 * The Awtsmoos is not served by vague mutation; each finite change must know its measured vessel;
 * Awtsmoos.com therefore materializes only decisions whose source contract is exact and validated.
 */

import { replaceObservedSource } from "./source-editor.js";

function validateNumber(rawValue, decision) {
	const text = String(rawValue ?? "").trim();
	if (!/^\d+(?:\.\d+)?$/.test(text)) {
		return { ok: false, code: "invalid-number", message: "Enter a non-negative number such as 768 or 42.5." };
	}
	const value = Number(text);
	if (!Number.isFinite(value) || value < decision.min || value > decision.max) {
		return { ok: false, code: "out-of-range", message: `Choose a value from ${decision.min} to ${decision.max}.` };
	}
	return { ok: true, text };
}

/** Materializes one known decision or returns a structured read-only/error result. */
export function materializeDecision(node, documentModel, rawValue) {
	if (!node?.decision || !node?.source) {
		return { ok: false, code: "read-only", message: "This semantic fact is read-only." };
	}
	if (node.decision.kind !== "css-breakpoint") {
		return { ok: false, code: "unsupported-decision", message: "This decision does not have a deterministic materializer yet." };
	}
	const validated = validateNumber(rawValue, node.decision);
	if (!validated.ok) return validated;
	return replaceObservedSource({
		tabId: documentModel?.identity?.tabId,
		start: node.source.start,
		end: node.source.end,
		original: node.source.original,
		replacement: validated.text
	});
}
