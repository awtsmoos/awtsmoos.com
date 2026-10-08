//B"H
//Boruch Hashem
//Blessed is He

import { qualityFinding } from "../../../tests/quality/finding.mjs";

/**
 * @file Layer 4 (Property Ownership) of the Airtight CSS Guarantee System — @tunnel-owns contract parsing and overlap checking.
 * @description Before the sefer reader shipped, the old reader set `color: white` while the new reader set `color: dark`
 * on overlapping elements, producing white-on-white in the light theme. These contracts let each CSS file declare which
 * properties it owns on which selectors, so the build can fail (in fail-closed mode) when two components claim the same
 * property on selectors that could match the same element.
 *
 * Contract syntax (a CSS comment at the top of the file or above a rule block):
 *   /* @tunnel-owns: .meluket-sefer { color, background-color, font-size } *\/
 *   /* @tunnel-owns: .meluket-hebrew { color } *\/
 *
 * Selector is required; the property list is comma-separated kebab-case CSS property names.
 * A file may carry multiple contract comments. A file with NO contracts owns nothing — its
 * rules are "unclaimed" (allowed, but reported as low-priority info by unclaimedRules).
 */

/**
 * One parsed ownership contract.
 * @typedef {object} OwnershipContract
 * @property {string} selector The CSS selector this contract claims ownership on.
 * @property {Set<string>} properties The CSS property names claimed for that selector.
 * @property {string} filePath The source file the contract was parsed from.
 * @property {number} line One-based line number of the contract comment.
 * @property {number} offset Character offset of the contract comment in the source.
 */

/**
 * Parses every well-formed @tunnel-owns contract comment out of CSS source text.
 * Malformed @tunnel-owns comments are SKIPPED here (never thrown) and reported as
 * findings by auditOwnership; see malformedContractFindings for the same pass.
 * @param {string} cssContent Raw CSS text.
 * @param {string} filePath Label attached to each returned contract.
 * @returns {Array<OwnershipContract>} The well-formed contracts found, in source order.
 */
export function parseContracts(cssContent, filePath) {
	const contracts = [];
	const content = String(cssContent || "");
	const wellFormed =
		/\/\*\s*@tunnel-owns\s*:\s*([^\{\}\*]+?)\s*\{\s*([^\{\}]*?)\s*\}\s*\*\//g;
	for (const match of content.matchAll(wellFormed)) {
		const selector = match[1].trim();
		const properties = parsePropertyList(match[2]);
		if (!selector || properties.size === 0) {
			continue;
		}
		contracts.push({
			selector,
			properties,
			filePath,
			line: lineNumberAt(content, match.index),
			offset: match.index
		});
	}
	return contracts;
}

/** Splits a contract's property list, keeping only valid kebab-case property names. */
function parsePropertyList(raw) {
	const properties = new Set();
	for (const token of String(raw).split(",")) {
		const property = token.trim().toLowerCase();
		if (/^[a-z][a-z0-9-]*$/.test(property)) {
			properties.add(property);
		}
	}
	return properties;
}

/**
 * Reports every @tunnel-owns comment that fails to parse, without throwing.
 * @param {string} cssContent Raw CSS text.
 * @param {string} filePath Label used by the parent audit for findings.
 * @returns {Array<{offset:number, line:number, raw:string, reason:string}>} Malformed contract records.
 */
export function malformedContractFindings(cssContent, filePath) {
	const content = String(cssContent || "");
	const malformed = [];
	const commentPattern = /\/\*[\s\S]*?(?:\*\/|$)/g;
	for (const comment of content.matchAll(commentPattern)) {
		if (!comment[0].includes("@tunnel-owns")) {
			continue;
		}
		if (isWellFormedContract(comment[0])) {
			continue;
		}
		malformed.push({
			offset: comment.index,
			line: lineNumberAt(content, comment.index),
			raw: comment[0].slice(0, 160),
			reason: describeMalformation(comment[0])
		});
	}
	return malformed;
}

/** Checks one comment string against the full contract grammar. */
function isWellFormedContract(comment) {
	return /^\s*\/\*\s*@tunnel-owns\s*:\s*[^\{\}\*]+?\s*\{\s*[^\{\}]*?\s*\}\s*\*\/\s*$/.test(comment);
}

/** Explains, in plain words, why a contract comment failed to parse. */
function describeMalformation(comment) {
	if (!/\{/.test(comment)) {
		return "missing opening brace: expected `@tunnel-owns: <selector> { <props> }`";
	}
	if (!/\}/.test(comment)) {
		return "missing closing brace: expected `@tunnel-owns: <selector> { <props> }`";
	}
	if (!/:\s*\S/.test(comment.replace("@tunnel-owns", ""))) {
		return "missing or empty selector before the brace";
	}
	return "unparseable contract: expected `/* @tunnel-owns: <selector> { <prop1>, <prop2> } */`";
}

/**
 * A single ownership conflict between two contracts.
 * @typedef {object} OwnershipConflict
 * @property {string} selectorA First contract's selector.
 * @property {string} selectorB Second contract's selector.
 * @property {string} property The CSS property both contracts claim.
 * @property {Array<string>} files The two contract file paths, [a, b] (may repeat one file).
 */

/**
 * Finds every pair of contracts whose selectors could match the same element
 * while claiming the same CSS property.
 * The overlap heuristic is deliberately CONSERVATIVE: it flags pairs that might
 * never actually collide (false positives) rather than miss a real one (false
 * negatives). See selectorsOverlap for the three rules.
 * @param {Array<OwnershipContract>} allContracts Contracts from every CSS file.
 * @returns {Array<OwnershipConflict>} One record per conflicting (selectorA, selectorB, property).
 */
export function checkOwnershipConflicts(allContracts) {
	const contracts = Array.isArray(allContracts) ? allContracts : [];
	const conflicts = [];
	for (let i = 0; i < contracts.length; i++) {
		for (let j = i + 1; j < contracts.length; j++) {
			const a = contracts[i];
			const b = contracts[j];
			if (!a || !b || !a.selector || !b.selector) {
				continue;
			}
			if (!selectorsOverlap(a.selector, b.selector)) {
				continue;
			}
			for (const property of a.properties || []) {
				if ((b.properties || new Set()).has(property)) {
					conflicts.push({
						selectorA: a.selector,
						selectorB: b.selector,
						property,
						files: [a.filePath, b.filePath]
					});
				}
			}
		}
	}
	return conflicts;
}

/**
 * Decides whether two selectors could match the same element, conservatively.
 * Rules, in order:
 * 1. Identical after normalization (whitespace collapsed, case lowered).
 * 2. Class-name cross-containment: one class name appears inside another
 *    (e.g. `.sefer` inside `.meluket-sefer` — the longer class may still be
 *    applied to the same element as the shorter one).
 * 3. Same rightmost compound selector (e.g. `.a .title` and `.b .title` both
 *    target `.title`; also `.a .title` vs `.title`).
 * Pseudo-classes and pseudo-elements are stripped from the rightmost compound
 * before comparison (`.title:hover` still targets `.title`).
 * This will flag pairs that can never truly collide (e.g. `.header .title` vs
 * `.footer .title` when no element carries both), by design: in fail-open mode
 * the finding is a warning; humans dismiss it, machines never miss the real one.
 * @param {string} a First selector.
 * @param {string} b Second selector.
 * @returns {boolean} True when the selectors may match the same element.
 */
export function selectorsOverlap(a, b) {
	const normA = normalizeSelector(a);
	const normB = normalizeSelector(b);
	if (!normA || !normB) {
		return false;
	}
	if (normA === normB) {
		return true;
	}
	if (classNamesContain(classNames(normA), classNames(normB))) {
		return true;
	}
	const rightA = rightmostCompound(normA);
	const rightB = rightmostCompound(normB);
	return Boolean(rightA && rightA === rightB);
}

/** Collapses whitespace runs and lowers case for stable comparison. */
function normalizeSelector(selector) {
	return String(selector || "").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Extracts class names from a normalized selector (without the dots). */
function classNames(selector) {
	const names = [];
	for (const match of selector.matchAll(/\.([a-z0-9_-]+)/g)) {
		names.push(match[1]);
	}
	return names;
}

/** True when any name from one list is a strict substring of a name from the other. */
function classNamesContain(left, right) {
	for (const x of left) {
		for (const y of right) {
			if (x !== y && (x.includes(y) || y.includes(x))) {
				return true;
			}
		}
	}
	return false;
}

/** Takes the last compound (after the final combinator), with pseudos stripped. */
function rightmostCompound(selector) {
	const parts = selector.split(/[\s>+~]+/).filter(Boolean);
	const last = parts[parts.length - 1] || "";
	return last.split(":")[0] || "";
}

/**
 * Runs the full Layer-4 audit over CSS sources: parses contracts, reports
 * malformed contracts, then reports every ownership conflict.
 * @param {Array<{path:string, content:string}>} sources CSS sources to audit.
 * @returns {Array<object>} qualityFinding records (category "css-ownership").
 */
export function auditOwnership(sources) {
	const list = Array.isArray(sources) ? sources : [];
	const findings = [];
	const allContracts = [];
	for (const source of list) {
		const record = toInventoryRecord(source);
		const contracts = parseContracts(record.content, record.relativePath);
		allContracts.push(...contracts);
		for (const malformed of malformedContractFindings(record.content, record.relativePath)) {
			findings.push(qualityFinding(record, {
				category: "css-ownership",
				severity: "low",
				confidence: "high",
				message: `Malformed @tunnel-owns contract at ${record.relativePath}:${malformed.line} — ${malformed.reason}. Skipped; the file owns nothing until it is fixed.`,
				offset: malformed.offset,
				snippet: malformed.raw
			}));
		}
	}
	const byFile = new Map();
	for (const contract of allContracts) {
		if (!byFile.has(contract.filePath)) {
			byFile.set(contract.filePath, []);
		}
		byFile.get(contract.filePath).push(contract);
	}
	for (const conflict of checkOwnershipConflicts(allContracts)) {
		const record = toInventoryRecord(list.find((s) => (s.path || s.relativePath) === conflict.files[0]) || list[0] || {});
		findings.push(qualityFinding(record, {
			category: "css-ownership",
			severity: "high",
			confidence: "medium",
			message: `Ownership conflict: "${conflict.selectorA}" and "${conflict.selectorB}" both claim "${conflict.property}" — ${conflict.files[0]} vs ${conflict.files[1]}. Resolve before fail-closed deploys (see selectorsOverlap: this heuristic is conservative and may flag non-collisions).`,
			offset: 0,
			snippet: `${conflict.selectorA} ↔ ${conflict.selectorB} : ${conflict.property}`
		}));
	}
	return findings;
}

/**
 * Flags CSS sources that carry no @tunnel-owns contracts at all, one info-level
 * finding per file, to encourage adoption. Owning nothing is allowed — it only
 * means the file's rules cannot be checked for ownership conflicts.
 * @param {Array<{path:string, content:string}>} sources CSS sources to audit.
 * @returns {Array<object>} qualityFinding records (category "css-ownership", severity "info").
 */
export function unclaimedRules(sources) {
	const list = Array.isArray(sources) ? sources : [];
	const findings = [];
	for (const source of list) {
		const record = toInventoryRecord(source);
		const contracts = parseContracts(record.content, record.relativePath);
		if (contracts.length > 0) {
			continue;
		}
		const selectors = ruleSelectors(record.content);
		if (selectors.length === 0) {
			continue;
		}
		findings.push(qualityFinding(record, {
			category: "css-ownership",
			severity: "info",
			confidence: "high",
			message: `${record.relativePath} has ${selectors.length} CSS rule(s) and no @tunnel-owns contracts — all rules are unclaimed, so ownership conflicts cannot be detected for this file.`,
			offset: 0,
			snippet: selectors.slice(0, 4).join(", ")
		}));
	}
	return findings;
}

/** Adapts the task's {path, content} source shape to the inventory shape qualityFinding needs. */
function toInventoryRecord(source) {
	const record = source || {};
	return {
		app: record.app || "tunnel",
		relativePath: record.relativePath || record.path || "(unknown css)",
		content: String(record.content || "")
	};
}

/** Lists top-level rule selectors in CSS text, comments masked, at-rules skipped. */
function ruleSelectors(content) {
	const masked = String(content).replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
	const selectors = [];
	const rulePattern = /([^{}]+)\{/g;
	for (const match of masked.matchAll(rulePattern)) {
		const text = match[1].trim();
		if (!text || text.startsWith("@")) {
			continue;
		}
		for (const selector of text.split(",")) {
			const normalized = selector.trim();
			if (normalized) {
				selectors.push(normalized);
			}
		}
	}
	return selectors;
}

/** Converts a character offset into a one-based line number. */
function lineNumberAt(content, offset) {
	return content.slice(0, Math.max(0, offset)).split(/\r?\n/).length;
}
