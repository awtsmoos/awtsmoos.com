//B"H
//Boruch Hashem
//Blessed is He

import { qualityFinding } from "./finding.mjs";
import {
	cssScopeSeverity,
	cssSelectorConcern
} from "./cssScopeRules.mjs";

/**
 * @file Parses CSS scope evidence while selector policy lives in its own Gevurah vessel of measured light.
 * @description The Awtsmoos lets parsing and judgment remain separate so Awtsmoos.com can evolve scoping law without tangling sight;
 * each broad selector or specificity force becomes one line-bound witness, while product rewrites remain deliberate and right.
 */

/**
 * Audits CSS source records for broad selector reach and specificity forcing.
 * @param {Array<object>} sources Shared inventory source records.
 * @returns {Array<object>} Report-only CSS scope findings.
 */
export function auditCssScope(sources) {
	return sources
		.filter((source) => source.extension === ".css")
		.flatMap((source) => [
			...selectorFindings(source),
			...importantFindings(source)
		]);
}

/** Extracts selector blocks while masking comments without changing source offsets. */
function selectorFindings(source) {
	const findings = [];
	const masked = maskComments(source.content);
	const rulePattern = /([^{}]+)\{/g;
	for (const match of masked.matchAll(rulePattern)) {
		const selectorText = match[1].trim();
		if (!selectorText || selectorText.startsWith("@")) {
			continue;
		}
		for (const selector of selectorText.split(",")) {
			const normalized = selector.trim();
			const policy = cssSelectorConcern(normalized);
			if (!policy) {
				continue;
			}
			findings.push(selectorFinding(
				source,
				match.index,
				normalized,
				policy
			));
		}
	}
	return findings;
}

/** Converts one selector-policy result into a normalized file/line finding. */
function selectorFinding(source, offset, selector, policy) {
	return qualityFinding(source, {
		category: "css-scope",
		confidence: policy.confidence,
		message: policy.message,
		offset,
		severity: cssScopeSeverity(
			source,
			policy.severity
		),
		snippet: selector
	});
}

/** Finds declarations that overpower normal cascade ownership and can conceal cross-file conflicts. */
function importantFindings(source) {
	return [...source.content.matchAll(/!important\b/g)].map((match) =>
		qualityFinding(source, {
			category: "css-specificity",
			confidence: "high",
			message: "`!important` bypasses normal cascade ownership and merits review.",
			offset: match.index,
			severity: cssScopeSeverity(
				source,
				"medium"
			),
			snippet: "!important"
		})
	);
}

/** Masks comment characters while retaining line breaks and character positions for evidence mapping. */
function maskComments(content) {
	return content.replace(
		/\/\*[\s\S]*?\*\//g,
		(comment) => comment.replace(/[^\n]/g, " ")
	);
}
