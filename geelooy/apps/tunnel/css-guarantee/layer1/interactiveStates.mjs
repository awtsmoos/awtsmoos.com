//B"H
//Boruch Hashem
//Blessed is He

import { auditInteractionStates } from "../../../tests/quality/interactionStateAudit.mjs";

/**
 * @file Layer 2 of the Airtight CSS Guarantee System: interactive-states blocking gate with auto-fix suggestions.
 * @description The Awtsmoos lets pointer, touch, and keyboard intention each receive a visible answer before
 * deploy; this module wraps the report-only interactionStateAudit and turns it into a gate — fail-open logs
 * findings without blocking, fail-closed blocks the deploy when any medium-or-higher finding is still open.
 * Every missing state also earns a concrete CSS suggestion, so the fix is one paste away from the ledger.
 */

const SEVERITY_RANK = Object.freeze({
	low: 1,
	medium: 2,
	high: 3,
	critical: 4
});

/**
 * Default declarations for each suggested interaction state. brightness(1.08) is a deliberate
 * neutral default: it visibly lifts the element on the dark themes Awtsmoos.com ships by default.
 * On light backgrounds a darken (e.g. brightness(0.92)) reads better — swap the value per theme;
 * the gate only checks that a state rule EXISTS, never what it declares.
 */
const STATE_DECLARATIONS = Object.freeze({
	":hover": "filter: brightness(1.08);",
	":active": "transform: scale(0.98);",
	":focus": "outline: 2px solid currentColor; outline-offset: 2px;",
	":focus-visible": "outline: 2px solid currentColor; outline-offset: 2px;"
});

/**
 * Runs the report-only interaction-state audit as a blocking-capable gate.
 * @param {Array<object>} sources CSS source records. Accepts the audit's inventory shape
 *   ({ extension: ".css", app, relativePath, content }) and the layer-1 convenience shape
 *   ({ path, content }); records are normalized to the inventory shape before the audit runs.
 * @param {object} [options] Gate options.
 * @param {boolean} [options.failClosed=false] When true, any finding of severity medium or
 *   higher blocks. Equivalent to options.mode === "fail-closed".
 * @param {string} [options.mode] "fail-open" (default) or "fail-closed" — mirrors
 *   the CSS_GUARANTEE_MODE feature flag from the system design doc.
 * @returns {{findings: Array<object>, blocking: boolean}} Findings in the repo's qualityFinding
 *   format (inherited from the audit: app, category, confidence, file, line, message, severity,
 *   snippet); blocking is true only in fail-closed mode with a medium-or-higher finding open.
 *   Fail-open mode always returns blocking: false.
 */
export function auditInteractiveStatesBlocking(sources, options = {}) {
	const normalized = (sources || [])
		.map(normalizeSource)
		.filter(Boolean);
	const findings = auditInteractionStates(normalized);
	const failClosed = options.failClosed === true || options.mode === "fail-closed";
	const blocking = failClosed
		&& findings.some((finding) =>
			(SEVERITY_RANK[finding.severity] || 0) >= SEVERITY_RANK.medium);
	return { findings, blocking };
}

/**
 * Generates a ready-to-paste CSS rule for one missing interaction state.
 * @param {string} baseSelector Interactive base selector, e.g. ".my-btn".
 * @param {string} state One of ":hover", ":active", ":focus", ":focus-visible".
 * @returns {string} CSS block, e.g. ".my-btn:hover {\n\tfilter: brightness(1.08);\n}".
 * @throws {RangeError} On an unknown state.
 */
export function suggestStateFix(baseSelector, state) {
	const declarations = STATE_DECLARATIONS[state];
	if (!declarations) {
		throw new RangeError(
			`Unknown interaction state "${state}". Expected one of: ${Object.keys(STATE_DECLARATIONS).join(", ")}.`
		);
	}
	return `${baseSelector}${state} {\n\t${declarations}\n}`;
}

/**
 * Generates one suggested CSS block per missing interaction state across all sources,
 * deduplicated by base selector + state so the same gap reported twice earns one suggestion.
 * @param {Array<object>} sources CSS source records (same shapes as auditInteractiveStatesBlocking).
 * @returns {Array<{base: string, state: string, css: string}>} Suggested fixes in first-seen
 *   order; base is the selector as written (from the finding's snippet), state the missing
 *   pseudo-class, css the ready-to-paste block from suggestStateFix.
 */
export function generateFixes(sources) {
	const { findings } = auditInteractiveStatesBlocking(sources, { failClosed: false });
	const seen = new Set();
	const fixes = [];
	for (const finding of findings) {
		const state = stateFromMessage(finding.message);
		const base = (finding.snippet || "").trim();
		if (!state || !base || !(state in STATE_DECLARATIONS)) {
			continue;
		}
		const key = `${base}${state}`;
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		fixes.push({ base, state, css: suggestStateFix(base, state) });
	}
	return fixes;
}

/** Normalizes either accepted source shape to the inventory shape the audit expects. */
function normalizeSource(source, index) {
	if (!source || typeof source.content !== "string") {
		return null;
	}
	const relativePath = source.relativePath || source.path || `unknown-${index}.css`;
	return {
		app: source.app || "css-guarantee",
		content: source.content,
		extension: source.extension || extensionOf(relativePath),
		relativePath
	};
}

/** Reads the file extension off a path, lowercased, for the audit's ".css" filter. */
function extensionOf(path) {
	const text = String(path);
	const dot = text.lastIndexOf(".");
	return dot === -1 ? "" : text.slice(dot).toLowerCase();
}

/** Recovers the missing state from the audit's "appears to lack :state styling" message. */
function stateFromMessage(message) {
	const match = /lacks?\s+(:[\w-]+)\s+styling/.exec(String(message || ""));
	return match ? match[1] : null;
}
