//B"H
//Boruch Hashem
//Blessed is He

import { qualityFinding } from "../../../tests/quality/finding.mjs";
import { splitSelectors } from "../cssParse.mjs";

/**
 * @file Layer 1 global selector registry for the Airtight CSS Guarantee System.
 * @description The Awtsmoos lets every stylesheet declare its territory once, so no two
 * readers ever fight over the same element again; each selector gains exactly one owning
 * file, and any double claim becomes a witnessed conflict before it can reach production.
 */

/**
 * At-rules whose blocks contain real style rules. Selectors inside these blocks are
 * registered normally; every other at-rule block (@keyframes, @font-face, ...) is skipped.
 */
const CONDITIONAL_AT_RULES = new Set([
	"@media",
	"@supports",
	"@container",
	"@layer",
	"@scope",
	"@starting-style"
]);

/**
 * Builds the global selector registry from CSS sources.
 * @param {Array<{path: string, content: string}>} sources CSS files to register.
 * @returns {{registry: Map<string, string>, conflicts: Array<{selector: string, files: Array<string>, findings: Array<object>}>}}
 *   registry maps each normalized selector to its owning file path (first claim wins);
 *   conflicts lists every selector claimed by two or more files, with one qualityFinding
 *   per claim so the clash joins the repo's standard finding ledger.
 */
export function buildSelectorRegistry(sources) {
	const registry = new Map();
	const claims = new Map();
	for (const source of sources || []) {
		if (!source || typeof source.content !== "string") {
			continue;
		}
		for (const occurrence of extractSelectorOccurrences(source.content)) {
			const normalized = normalizeSelector(occurrence.selector);
			if (!normalized) {
				continue;
			}
			if (!registry.has(normalized)) {
				registry.set(normalized, source.path);
			}
			let list = claims.get(normalized);
			if (!list) {
				list = [];
				claims.set(normalized, list);
			}
			list.push({ path: source.path, offset: occurrence.offset, source });
		}
	}
	const conflicts = [];
	for (const [selector, list] of claims) {
		const files = [...new Set(list.map((claim) => claim.path))].sort();
		if (files.length < 2) {
			continue;
		}
		conflicts.push({
			selector,
			files,
			findings: list.map((claim) => qualityFinding(toFindingSource(claim.source), {
				category: "css-registry-conflict",
				confidence: "high",
				message: `Selector "${selector}" is claimed by ${files.length} files (${files.join(", ")}); exactly one owning file is allowed.`,
				offset: claim.offset,
				severity: "high",
				snippet: selector
			}))
		});
	}
	conflicts.sort((left, right) => left.selector < right.selector ? -1 : left.selector > right.selector ? 1 : 0);
	return { registry, conflicts };
}

/**
 * Renders conflicts as a human-readable report.
 * @param {Array<{selector: string, files: Array<string>}>} conflicts Conflicts from buildSelectorRegistry.
 * @returns {string} Plain-text report, one block per conflicting selector.
 */
export function formatRegistryReport(conflicts) {
	if (!conflicts || conflicts.length === 0) {
		return "CSS selector registry: clean — every selector is claimed by exactly one file.\n";
	}
	const lines = [
		`CSS selector registry: ${conflicts.length} conflicting selector${conflicts.length === 1 ? "" : "s"} — each selector must have exactly one owning file.`,
		""
	];
	for (const conflict of conflicts) {
		lines.push(`CONFLICT  ${conflict.selector}`);
		for (const file of conflict.files) {
			lines.push(`    claimed by ${file}`);
		}
		lines.push("");
	}
	return lines.join("\n");
}

/** Adapts a registry source record to the shape qualityFinding expects. */
function toFindingSource(source) {
	return {
		app: "css-guarantee",
		relativePath: source.path,
		content: source.content
	};
}

/**
 * Extracts every real selector occurrence from one stylesheet, with source offsets.
 * Comment text is masked without shifting offsets; string literals are tracked so
 * braces inside `content: "}"` never confuse the scan. At-rule preludes are skipped,
 * but conditional at-rule blocks (@media, @supports, ...) are descended into while
 * non-conditional blocks (@keyframes, @font-face, ...) are not registered.
 * @param {string} content Raw CSS text.
 * @returns {Array<{selector: string, offset: number}>} Raw selectors in source order.
 */
function extractSelectorOccurrences(content) {
	const masked = maskComments(content);
	const occurrences = [];
	const stack = [];
	let preludeStart = 0;
	let quote = null;
	let i = 0;
	while (i < masked.length) {
		const ch = masked[i];
		if (quote) {
			if (ch === "\\") {
				i += 2;
				continue;
			}
			if (ch === quote) {
				quote = null;
			}
			i += 1;
			continue;
		}
		if (ch === '"' || ch === "'") {
			quote = ch;
			i += 1;
			continue;
		}
		if (ch === "{") {
			const rawPrelude = masked.slice(preludeStart, i);
			const prelude = rawPrelude.trim();
			const base = preludeStart + (rawPrelude.length - rawPrelude.trimStart().length);
			const parentSkipped = stack.some((frame) => frame.skipped);
			if (prelude.startsWith("@")) {
				const name = prelude.split(/[\s({]/, 1)[0].toLowerCase();
				stack.push({ skipped: parentSkipped || !CONDITIONAL_AT_RULES.has(name) });
			} else {
				const skipped = parentSkipped;
				stack.push({ skipped });
				if (!skipped && prelude) {
					let searchFrom = 0;
					for (const part of splitSelectors(prelude)) {
						const selector = part.trim();
						if (selector) {
							const relative = prelude.indexOf(selector, searchFrom);
							occurrences.push({ selector, offset: base + relative });
							searchFrom = relative + selector.length;
						}
					}
				}
			}
			preludeStart = i + 1;
			i += 1;
			continue;
		}
		if (ch === "}") {
			stack.pop();
			preludeStart = i + 1;
			i += 1;
			continue;
		}
		if (ch === ";" && stack.length === 0) {
			preludeStart = i + 1;
		}
		i += 1;
	}
	return occurrences;
}

/**
 * Normalizes a selector for ownership comparison: trims, collapses runs of
 * whitespace to one space, and lowercases ASCII element (type) names — which are
 * case-insensitive in HTML — while leaving .class, #id, :pseudo, and [attr]
 * names untouched, since those are case-sensitive.
 * @param {string} selector Raw selector text.
 * @returns {string} Normalized selector key.
 */
function normalizeSelector(selector) {
	return selector
		.trim()
		.replace(/\s+/g, " ")
		.replace(/(^|[\s>+~(,])([A-Za-z][\w-]*)/g,
			(match, prefix, name) => prefix + name.toLowerCase());
}

/** Masks comment characters while retaining line breaks and character positions for evidence mapping. */
function maskComments(content) {
	return content.replace(
		/\/\*[\s\S]*?\*\//g,
		(comment) => comment.replace(/[^\n]/g, " ")
	);
}
