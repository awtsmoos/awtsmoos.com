//B"H
//Boruch Hashem
//Blessed is He

import { qualityFinding } from "./finding.mjs";

/**
 * @file Finds high-signal interactive CSS families whose hover, active, or focus-visible states appear incomplete.
 * @description The Awtsmoos lets pointer, touch, and keyboard intention each receive a visible answer in light;
 * Awtsmoos.com reports only confident interactive families so accessibility grows without false-positive noise in sight.
 */
const REQUIRED_STATES = Object.freeze([
	":hover",
	":active",
	":focus-visible"
]);

/**
 * Audits CSS sources for likely missing interaction-state companions.
 * @param {Array<object>} sources Shared source inventory.
 * @returns {Array<object>} Report-only findings with medium confidence.
 */
export function auditInteractionStates(sources) {
	return sources
		.filter((source) => source.extension === ".css")
		.flatMap((source) => auditStylesheet(source));
}

/** Finds interactive base selectors, then verifies their state companions within the same stylesheet. */
function auditStylesheet(source) {
	const rules = cssRules(source.content);
	const selectorUniverse = rules
		.flatMap((rule) => rule.selectors)
		.join("\n");
	const findings = [];
	for (const rule of rules) {
		for (const selector of rule.selectors) {
			if (!isInteractiveBase(selector, rule.body)) {
				continue;
			}
			const base = baseSelector(selector);
			for (const state of REQUIRED_STATES) {
				if (hasState(selectorUniverse, base, state)) {
					continue;
				}
				findings.push(qualityFinding(source, {
					category: "interaction-state",
					confidence: "medium",
					message: `Interactive selector appears to lack ${state} styling.`,
					offset: rule.offset,
					severity: state === ":focus-visible" ? "medium" : "low",
					snippet: selector
				}));
			}
		}
	}
	return findings;
}

/** Parses simple selector blocks while preserving enough source offset for evidence reporting. */
function cssRules(content) {
	const masked = maskComments(content);
	const pattern = /([^{}]+)\{([^{}]*)\}/g;
	return [...masked.matchAll(pattern)]
		.filter((match) => !match[1].trim().startsWith("@"))
		.map((match) => ({
			body: match[2],
			offset: match.index,
			selectors: match[1]
				.split(",")
				.map((selector) => selector.trim())
				.filter(Boolean)
		}));
}

/** Recognizes deliberate button/link/role selectors and pointer declarations while excluding existing state selectors. */
function isInteractiveBase(selector, body) {
	if (/:(?:hover|active|focus|focus-visible|disabled)\b/.test(selector)) {
		return false;
	}
	return /\bbutton\b|\[role=["']?button|\.(?:btn|button)(?:\b|[-_])|^a(?:[.#[:]|\b)/i.test(selector)
		|| /\bcursor\s*:\s*pointer\b/i.test(body);
}

/** Removes pseudo-state suffixes while retaining app/component scope for companion lookup. */
function baseSelector(selector) {
	return selector
		.replace(/::?[a-z-]+(?:\([^)]*\))?/gi, "")
		.trim();
}

/** Tests whether the stylesheet contains the same scoped selector family with one required pseudo-state. */
function hasState(universe, base, state) {
	if (!base) {
		return false;
	}
	const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`${escaped}[^\\n{]*${state.replace("-", "\\-")}`).test(universe);
}

function maskComments(content) {
	return content.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
		comment.replace(/[^\n]/g, " ")
	);
}
