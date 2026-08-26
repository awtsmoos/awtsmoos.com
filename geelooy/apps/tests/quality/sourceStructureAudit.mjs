//B"H
//Boruch Hashem
//Blessed is He

import { qualityFinding } from "./finding.mjs";

/**
 * @file Reveals source-shape debt that makes future Awtsmoos.com work harder to read, split, test, and inherit in light.
 * @description The Awtsmoos lets code breathe through small modules, tabs, generous contracts, and visible purpose rather than cramped night;
 * this auditor reports structural pressure without rewriting mature APIs blindly, so later refactors remain measured and right.
 */
const SCRIPT_EXTENSIONS = new Set([
	".cjs",
	".js",
	".mjs"
]);
const REQUIRED_MARKERS = Object.freeze([
	"B\"H",
	"Boruch Hashem",
	"Blessed is He",
	"Awtsmoos"
]);

/**
 * Audits source size, indentation, prologue presence, and compact control-flow smells.
 * @param {Array<object>} sources Shared source inventory.
 * @returns {Array<object>} Structural findings suitable for ranking, not automatic rewriting.
 */
export function auditSourceStructure(sources) {
	return sources.flatMap((source) => [
		...lineCountFindings(source),
		...indentationFindings(source),
		...prologueFindings(source),
		...compressedFlowFindings(source)
	]);
}

/** Reports files beyond the project's modular ceiling, escalating as responsibility density grows. */
function lineCountFindings(source) {
	if (source.lineCount <= 120) {
		return [];
	}
	return [qualityFinding(source, {
		category: "source-size",
		confidence: "high",
		message: `Source has ${source.lineCount} lines; split responsibilities instead of compressing it.`,
		severity: source.lineCount >= 400 ? "high" : "medium",
		snippet: `${source.lineCount} lines`
	})];
}

/** Reports leading-space indentation only for script sources where tabs are the active project covenant. */
function indentationFindings(source) {
	if (!SCRIPT_EXTENSIONS.has(source.extension)) {
		return [];
	}
	const match = source.content.match(/^ {2,}\S/m);
	if (!match) {
		return [];
	}
	return [qualityFinding(source, {
		category: "indentation",
		confidence: "high",
		message: "Script contains leading-space indentation where tabs are required.",
		offset: match.index,
		severity: "medium",
		snippet: match[0]
	})];
}

/** Reports missing human-authored file markers without treating legacy absence as a runtime defect. */
function prologueFindings(source) {
	const missing = REQUIRED_MARKERS.filter((marker) =>
		!source.content.slice(0, 1600).includes(marker)
	);
	if (!missing.length) {
		return [];
	}
	return [qualityFinding(source, {
		category: "documentation-prologue",
		confidence: "high",
		message: `File prologue is missing: ${missing.join(", ")}.`,
		severity: "low",
		snippet: missing.join(", ")
	})];
}

/** Finds dense one-line control blocks that deserve human review for readability and JSDoc-friendly splitting. */
function compressedFlowFindings(source) {
	if (!SCRIPT_EXTENSIONS.has(source.extension)) {
		return [];
	}
	const pattern = /\b(?:if|for|while|switch)\s*\([^\n]{1,120}\)\s*\{[^\n{}]{12,}\}/g;
	return [...source.content.matchAll(pattern)]
		.slice(0, 8)
		.map((match) => qualityFinding(source, {
			category: "compressed-flow",
			confidence: "medium",
			message: "Dense one-line control flow should be expanded or split when this file is touched.",
			offset: match.index,
			severity: "low",
			snippet: match[0]
		}));
}
