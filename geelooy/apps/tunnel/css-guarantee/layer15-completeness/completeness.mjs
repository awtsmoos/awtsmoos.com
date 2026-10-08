//B"H
//Boruch Hashem
//Blessed is He

import { qualityFinding } from "../../../tests/quality/finding.mjs";
import { splitSelectors } from "../cssParse.mjs";
import { parseColor, contrastRatio, isOpaque, backgroundKind, luminance } from "./colors.mjs";

/**
 * @file Layer 15 of the Airtight CSS Guarantee System: completeness.
 * @description Layers 1–14 prove CSS does not CONFLICT. Layer 15 proves it is
 * not MISSING. A theme variant that was never written cannot conflict with
 * anything — yet it breaks real users exactly as badly. This module audits:
 *
 *  A. Theme-variant symmetry — a component themed for one declared theme must
 *     be themed for every declared theme ([data-theme="dark"] without a
 *     [data-theme="light"] twin is a blocking omission).
 *  B. State×theme symmetry — interactive states (:hover/:active/:focus/
 *     :focus-visible) themed for one theme must exist for every theme.
 *  C. Critical-property completeness — resolved per-theme color/background
 *     pairs must have readable contrast (no invisible text), and a background
 *     must never be set without an explicit text color in a multi-theme
 *     codebase (the white-on-white pattern).
 *
 * Fail-open reports; fail-closed blocks the deploy on any medium-or-higher
 * finding — an omission is a defect, not a warning.
 */

const SEVERITY_RANK = Object.freeze({
	low: 1,
	medium: 2,
	high: 3,
	critical: 4
});

const INTERACTIVE_STATES = Object.freeze([":hover", ":active", ":focus", ":focus-visible"]);

/** Theme-dependent properties whose literal values differ per theme. */
const THEME_COLOR_PROPS = new Set([
	"color", "background-color", "border-color",
	"border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
	"outline-color", "text-decoration-color", "fill", "stroke", "caret-color",
	"column-rule-color", "flood-color", "lighting-color", "stop-color"
]);

/**
 * Normalizes a property to its color aspect so shorthand/longhand pairs
 * compare equal (base `border:` covers a themed `border-color:`).
 * Returns null for properties with no color aspect.
 * @param {string} prop Lowercased property name.
 * @returns {string|null}
 */
function colorAspect(prop) {
	if (THEME_COLOR_PROPS.has(prop)) return prop;
	if (prop === "background") return "background-color";
	if (prop === "border") return "border-color";
	if (prop === "border-top") return "border-top-color";
	if (prop === "border-right") return "border-right-color";
	if (prop === "border-bottom") return "border-bottom-color";
	if (prop === "border-left") return "border-left-color";
	if (prop === "border-block" || prop === "border-inline") return "border-color";
	if (prop === "outline") return "outline-color";
	if (prop === "text-decoration") return "text-decoration-color";
	return null;
}

/** Collects normalized color aspects from a declarations map. */
function themeColorAspects(declarations) {
	const aspects = new Set();
	for (const prop of declarations.keys()) {
		const aspect = colorAspect(prop);
		if (aspect) aspects.add(aspect);
	}
	return aspects;
}

const CONDITIONAL_AT_RULES = new Set([
	"@media", "@supports", "@container", "@layer", "@scope", "@starting-style"
]);

/** Same escape hatch as the pipeline: grandfathered files skip hygiene checks. */
const GRANDFATHER_RE = /\/\*\s*@tunnel-grandfather\b([^*]*)\*\//;

/**
 * Runs the Layer 15 completeness audit.
 * @param {Array<{path:string,content:string}>} sources CSS sources.
 * @param {object} [options]
 * @param {string} [options.mode] "fail-open" (default) | "fail-closed".
 * @param {boolean} [options.failClosed] Alias for mode === "fail-closed".
 * @returns {{findings:Array<object>, blocking:boolean, stats:object}}
 */
export function auditCompleteness(sources, options = {}) {
	const failClosed = options.failClosed === true || options.mode === "fail-closed";
	const active = (sources || []).filter((s) =>
		s && typeof s.content === "string" && !GRANDFATHER_RE.test(s.content));

	const rules = [];
	for (const source of active) {
		for (const rule of parseRules(source.content)) {
			rules.push({ ...rule, path: source.path, content: source.content });
		}
	}

	const declaredThemes = new Set();
	for (const rule of rules) {
		for (const selector of rule.selectors) {
			const info = extractThemeInfo(selector, rule.mediaTheme);
			if (info.theme) declaredThemes.add(info.theme);
		}
	}

	const varTable = buildVarTable(rules, declaredThemes);
	const findings = [];
	findings.push(...checkThemeSymmetry(rules, declaredThemes));
	findings.push(...checkStateThemeSymmetry(rules, declaredThemes));
	findings.push(...checkCriticalProperties(rules, declaredThemes, varTable));
	findings.push(...checkThemeBlindLiterals(rules, declaredThemes, varTable));

	const blocking = failClosed && findings.some((f) =>
		(SEVERITY_RANK[f.severity] || 0) >= SEVERITY_RANK.medium);
	return {
		findings,
		blocking,
		stats: {
			rules: rules.length,
			declaredThemes: [...declaredThemes].sort(),
			findings: findings.length
		}
	};
}

/**
 * Generates a starter CSS block for a missing theme variant.
 * @param {string} core Theme-neutral core selector.
 * @param {string} theme "light" | "dark".
 * @returns {string} Ready-to-paste rule.
 */
export function suggestThemeFix(core, theme) {
	const target = core || ":root";
	return `:where(:root[data-theme="${theme}"]) ${target} {\n\t/* TODO: mirror the ${theme === "light" ? "dark" : "light"} variant's theme-dependent properties here */\n\tcolor: inherit;\n\tbackground-color: transparent;\n}`;
}

// ---------------------------------------------------------------------------
// Rule parsing
// ---------------------------------------------------------------------------

/**
 * Parses a stylesheet into flat rules with theme context.
 * @param {string} content Raw CSS.
 * @returns {Array<{selectors:string[], declarations:Map<string,{value:string,important:boolean}>, theme:string|null, mediaTheme:string|null, offset:number, prelude:string}>}
 */
export function parseRules(content) {
	const masked = maskComments(content);
	const rules = [];
	// Stack frames: { skipped:boolean, mediaTheme:string|null }
	const stack = [];
	let preludeStart = 0;
	let quote = null;
	let i = 0;
	while (i < masked.length) {
		const ch = masked[i];
		if (quote) {
			if (ch === "\\") { i += 2; continue; }
			if (ch === quote) quote = null;
			i += 1;
			continue;
		}
		if (ch === '"' || ch === "'") { quote = ch; i += 1; continue; }
		if (ch === "{") {
			const rawPrelude = masked.slice(preludeStart, i);
			const prelude = rawPrelude.trim();
			const base = preludeStart + (rawPrelude.length - rawPrelude.trimStart().length);
			const parent = stack[stack.length - 1];
			const parentSkipped = parent ? parent.skipped : false;
			const parentTheme = parent ? parent.mediaTheme : null;
			if (prelude.startsWith("@")) {
				const name = prelude.split(/[\s({]/, 1)[0].toLowerCase();
				const mediaTheme = name === "@media" ? mediaThemeOf(prelude) : parentTheme;
				stack.push({
					skipped: parentSkipped || !CONDITIONAL_AT_RULES.has(name),
					mediaTheme,
					isAtRule: true,
					blockStart: i + 1
				});
			} else {
				const skipped = parentSkipped;
				const frame = {
					skipped,
					mediaTheme: parentTheme,
					isAtRule: false,
					blockStart: i + 1,
					prelude,
					offset: base
				};
				stack.push(frame);
				if (!skipped && prelude) {
					frame.ruleIndex = rules.length;
					rules.push({
						selectors: splitSelectors(prelude).filter(Boolean),
						declarations: null, // filled at close
						mediaTheme: parentTheme,
						offset: base,
						prelude,
						_blockStart: i + 1
					});
				}
			}
			preludeStart = i + 1;
			i += 1;
			continue;
		}
		if (ch === "}") {
			const frame = stack.pop();
			if (frame && !frame.isAtRule && !frame.skipped && frame.ruleIndex !== undefined) {
				const rule = rules[frame.ruleIndex];
				rule.declarations = parseDeclarations(masked.slice(frame.blockStart, i));
				delete rule._blockStart;
			}
			preludeStart = i + 1;
			i += 1;
			continue;
		}
		if (ch === ";" && stack.length === 0) preludeStart = i + 1;
		i += 1;
	}
	return rules.filter((r) => r.declarations);
}

/** Masks block comments without shifting offsets. */
function maskComments(content) {
	return String(content).replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
}

/** Extracts prefers-color-scheme theme from a @media prelude, else null. */
function mediaThemeOf(prelude) {
	const m = /prefers-color-scheme\s*:\s*(dark|light)/i.exec(prelude);
	return m ? m[1].toLowerCase() : null;
}

/** Parses a declaration block into prop → {value, important}. */
function parseDeclarations(block) {
	const map = new Map();
	let current = "";
	let depth = 0;
	let quote = null;
	const flush = () => {
		const text = current.trim();
		current = "";
		if (!text) return;
		const colon = text.indexOf(":");
		if (colon === -1) return;
		const prop = text.slice(0, colon).trim().toLowerCase();
		let value = text.slice(colon + 1).trim();
		if (!prop) return;
		let important = false;
		if (/\s*!important\s*$/i.test(value)) {
			important = true;
			value = value.replace(/\s*!important\s*$/i, "").trim();
		}
		map.set(prop, { value, important });
	};
	for (let i = 0; i < block.length; i++) {
		const ch = block[i];
		if (quote) {
			current += ch;
			if (ch === "\\" && i + 1 < block.length) { current += block[++i]; continue; }
			if (ch === quote) quote = null;
			continue;
		}
		if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
		if (ch === "(") depth++;
		else if (ch === ")") depth = Math.max(0, depth - 1);
		if (ch === ";" && depth === 0) { flush(); continue; }
		current += ch;
	}
	flush();
	return map;
}

// ---------------------------------------------------------------------------
// Theme extraction
// ---------------------------------------------------------------------------

const DATA_THEME_RE = /\[data-theme\s*=\s*("light"|"dark"|'light'|'dark')\]/i;

/**
 * Splits a selector into top-level compound units (paren-aware).
 * @param {string} selector
 * @returns {string[]}
 */
function splitCompounds(selector) {
	const units = [];
	let depth = 0;
	let current = "";
	let quote = null;
	for (let i = 0; i < selector.length; i++) {
		const ch = selector[i];
		if (quote) {
			current += ch;
			if (ch === quote) quote = null;
			continue;
		}
		if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
		if (ch === "(") depth++;
		else if (ch === ")") depth = Math.max(0, depth - 1);
		if (depth === 0 && (ch === " " || ch === "\t" || ch === ">" || ch === "+" || ch === "~")) {
			if (current.trim()) units.push(current.trim());
			current = "";
			continue;
		}
		current += ch;
	}
	if (current.trim()) units.push(current.trim());
	return units;
}

/**
 * Extracts the theme qualifier from a selector and returns the theme-neutral
 * core used for cross-theme grouping.
 * @param {string} selector Raw selector.
 * @param {string|null} mediaTheme Theme from enclosing @media, if any.
 * @returns {{theme:string|null, core:string, themeSource:"selector"|"media"|null}}
 */
export function extractThemeInfo(selector, mediaTheme = null) {
	const text = String(selector);
	let theme = null;
	let excludedTheme = null;
	let match = null;
	// Rightmost data-theme wins (closest to the target element).
	// A data-theme inside :not() is a NEGATION (":not([data-theme=dark])"
	// means "every theme except dark") — never a positive theme.
	const NOT_RE = /:not\(\s*\[data-theme\s*=\s*["']?([a-z]+)["']?\s*\]\)/gi;
	let notMatch = null;
	for (const m of text.matchAll(NOT_RE)) notMatch = m;
	if (notMatch) {
		excludedTheme = notMatch[1].toLowerCase();
	}
	// Positive match: skip any occurrence inside :not(...).
	const positiveRanges = [];
	let m;
	const re = new RegExp(DATA_THEME_RE.source, "gi");
	while ((m = re.exec(text)) !== null) {
		// Check if this match is inside a :not( ... ).
		const before = text.slice(0, m.index);
		const notOpen = before.lastIndexOf(":not(");
		const notClose = before.lastIndexOf(")");
		const insideNot = notOpen !== -1 && notOpen > notClose;
		if (!insideNot) {
			match = m;
		}
	}
	if (match) {
		theme = match[1].replace(/['"]/g, "").toLowerCase();
	}
	const themeSource = theme ? "selector" : (mediaTheme ? "media" : null);
	if (!theme && mediaTheme) theme = mediaTheme;

	let core = text;
	const attrText = match ? match[0] : (notMatch ? notMatch[0] : null);
	if (attrText) {
		const units = splitCompounds(text);
		const kept = [];
		for (const unit of units) {
			if (!unit.includes(attrText)) { kept.push(unit); continue; }
			const trimmed = unit.trim();
			// Drop the whole compound when it is only the theme qualifier
			// (possibly wrapped in :where()/:is(), or on html/body/:root).
			if (trimmed === attrText
				|| /^:(where|is)\(.*\)$/is.test(trimmed)
				|| /^(html|body|:root)\s*\[data-theme/i.test(trimmed)) {
				continue;
			}
			kept.push(unit.replace(attrText, "").trim());
		}
		core = kept.join(" ");
	}
	// Normalize grouping key: drop leading bare :root/html/body ancestors.
	let coreUnits = splitCompounds(core);
	while (coreUnits.length > 1 && /^(html|body|:root)$/i.test(coreUnits[0])) {
		coreUnits.shift();
	}
	core = coreUnits.join(" ").replace(/\s+/g, " ").trim();
	return { theme, excludedTheme, core, themeSource };
}

// ---------------------------------------------------------------------------
// CSS variable table (per-theme resolution for contrast checks)
// ---------------------------------------------------------------------------

function buildVarTable(rules, declaredThemes) {
	// varTable = { base: Map, light: Map, dark: Map }
	const table = { base: new Map(), light: new Map(), dark: new Map() };
	const themeList = [...declaredThemes];
	for (const rule of rules) {
		for (const selector of rule.selectors) {
			const info = extractThemeInfo(selector, rule.mediaTheme);
			// Variable definitions live on root-level selectors.
			const isRootish = info.core === ""
				|| /^(html|body|:root)$/i.test(info.core)
				|| /:root/i.test(selector);
			if (!isRootish) continue;
			// A :not([data-theme="X"]) rule applies to every declared theme
			// except X (commonly used as the "light" fallback).
			let buckets;
			if (info.theme && table[info.theme]) {
				buckets = [info.theme];
			} else if (info.excludedTheme && themeList.length > 0) {
				buckets = themeList.filter((t) => t !== info.excludedTheme && table[t]);
				if (buckets.length === 0) buckets = ["base"];
			} else {
				buckets = ["base"];
			}
			for (const [prop, decl] of rule.declarations) {
				if (prop.startsWith("--")) {
					for (const b of buckets) table[b].set(prop, decl.value);
				}
			}
		}
	}
	return table;
}

/** Resolves var() references using the per-theme table (depth-limited). */
function resolveValue(value, theme, varTable, depth = 0) {
	if (typeof value !== "string" || depth > 5) return value;
	const text = value.trim();
	if (!text.startsWith("var(")) return value;
	const inner = text.slice(4, text.lastIndexOf(")"));
	const comma = topComma(inner);
	let name, fallback = null;
	if (comma === -1) name = inner.trim();
	else { name = inner.slice(0, comma).trim(); fallback = inner.slice(comma + 1).trim(); }
	const bucket = theme && varTable[theme] ? varTable[theme] : null;
	let resolved = bucket && bucket.has(name) ? bucket.get(name) : null;
	if (resolved === null && varTable.base.has(name)) resolved = varTable.base.get(name);
	if (resolved === null) return fallback === null ? null : resolveValue(fallback, theme, varTable, depth + 1);
	return resolveValue(resolved, theme, varTable, depth + 1);
}

function topComma(text) {
	let depth = 0;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (ch === "(") depth++;
		else if (ch === ")") depth = Math.max(0, depth - 1);
		else if (ch === "," && depth === 0) return i;
	}
	return -1;
}

// ---------------------------------------------------------------------------
// Check A — theme-variant symmetry
// ---------------------------------------------------------------------------

function checkThemeSymmetry(rules, declaredThemes) {
	const findings = [];
	if (declaredThemes.size < 2) return findings;
	// Group by TARGET element (rightmost compound): theme-symmetry asks whether
	// a component is styled in every theme, and ancestor variants
	// (".ctx .x" vs ":where(.ctx[theme]) .x") target the same component.
	// key -> { target, propsByTheme: Map<theme, Set<prop>>, baseProps: Set<prop>, witness }
	const byTarget = new Map();
	for (const rule of rules) {
		for (const selector of rule.selectors) {
			const info = extractThemeInfo(selector, rule.mediaTheme);
			if (!info.core) continue;
			const compounds = info.core.split(" ").filter(Boolean);
			const target = compounds.length > 0 ? compounds[compounds.length - 1] : info.core;
			let entry = byTarget.get(target);
			if (!entry) {
				entry = { target, propsByTheme: new Map(), baseProps: new Set(), witness: null };
				byTarget.set(target, entry);
			}
			const themeProps = themeColorAspects(rule.declarations);
			if (info.theme) {
				let set = entry.propsByTheme.get(info.theme);
				if (!set) { set = new Set(); entry.propsByTheme.set(info.theme, set); }
				for (const p of themeProps) set.add(p);
			} else if (info.excludedTheme) {
				// :not([data-theme="X"]) covers every declared theme except X.
				for (const t of declaredThemes) {
					if (t === info.excludedTheme) continue;
					let set = entry.propsByTheme.get(t);
					if (!set) { set = new Set(); entry.propsByTheme.set(t, set); }
					for (const p of themeProps) set.add(p);
				}
			} else {
				for (const p of themeProps) entry.baseProps.add(p);
			}
			if (!entry.witness && info.theme) {
				entry.witness = {
					path: rule.path, content: rule.content,
					offset: rule.offset, selector
				};
			}
		}
	}
	for (const [target, entry] of [...byTarget.entries()].sort(([a], [b]) => a < b ? -1 : 1)) {
		if (entry.propsByTheme.size === 0) continue;
		const themedThemes = [...entry.propsByTheme.keys()].sort();
		for (const theme of [...declaredThemes].sort()) {
			if (entry.propsByTheme.has(theme)) continue;
			// Base covers the missing theme only for properties it actually sets:
			// base styles ARE one theme's styles; the omission is real only for
			// theme-dependent properties the base never provides.
			const needed = new Set();
			for (const [t, props] of entry.propsByTheme) {
				if (t === theme) continue;
				for (const p of props) needed.add(p);
			}
			const uncovered = [...needed].filter((p) => !entry.baseProps.has(p)).sort();
			if (uncovered.length === 0) continue;
			if (!entry.witness) {
				entry.witness = { path: "", content: "", offset: 0, selector: target };
			}
			findings.push(qualityFinding(
				{ app: "css-guarantee", relativePath: entry.witness.path, content: entry.witness.content },
				{
					category: "css-completeness-theme",
					confidence: "high",
					message: `Component "${target}" is themed for [data-theme="${themedThemes.join(", ")}"] but [data-theme="${theme}"] leaves ${uncovered.join(", ")} unstyled — ${theme}-theme users get wrong-theme rendering for those properties. Add the missing variant or grandfather with a documented reason.`,
					offset: entry.witness.offset,
					severity: "high",
					snippet: entry.witness.selector
				}
			));
		}
	}
	return findings;
}

// ---------------------------------------------------------------------------
// Check B — interactive-state × theme symmetry
// ---------------------------------------------------------------------------

function checkStateThemeSymmetry(rules, declaredThemes) {
	const findings = [];
	if (declaredThemes.size < 2) return findings;
	// key -> { target, state, themesWithState: Set, baseHasState: bool, witness }
	// Grouped by TARGET element (rightmost compound): ancestor variants of the
	// same themed component (".ctx .x:hover" vs ":where(.ctx[theme]) .x:hover")
	// address the same interactive element.
	const byCoreState = new Map();
	for (const rule of rules) {
		for (const selector of rule.selectors) {
			// Match state pseudos precisely: ":focus" must not match ":focus-visible".
			const states = INTERACTIVE_STATES.filter((s) =>
				new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\w-])").test(selector));
			if (states.length === 0) continue;
			const info = extractThemeInfo(selector, rule.mediaTheme);
			if (!info.core) continue;
			const compounds = info.core.split(" ").filter(Boolean);
			const target = compounds.length > 0 ? compounds[compounds.length - 1] : info.core;
			for (const state of states) {
				const key = `${target}||${state}`;
				let entry = byCoreState.get(key);
				if (!entry) {
					entry = { target, state, themesWithState: new Set(), baseHasState: false, witness: null };
					byCoreState.set(key, entry);
				}
				// Presence is the signal: a themed state rule IS the visible
				// answer for that theme, whatever properties it sets.
				// :not([data-theme="X"]) covers every declared theme except X.
				if (info.theme) {
					entry.themesWithState.add(info.theme);
					if (!entry.witness) {
						entry.witness = {
							path: rule.path, content: rule.content,
							offset: rule.offset, selector
						};
					}
				} else if (info.excludedTheme) {
					for (const t of declaredThemes) {
						if (t !== info.excludedTheme) entry.themesWithState.add(t);
					}
					if (!entry.witness) {
						entry.witness = {
							path: rule.path, content: rule.content,
							offset: rule.offset, selector
						};
					}
				} else {
					entry.baseHasState = true;
				}
			}
		}
	}
	for (const entry of [...byCoreState.values()].sort((a, b) =>
		a.target < b.target ? -1 : a.target > b.target ? 1 : a.state < b.state ? -1 : 1)) {
		if (entry.themesWithState.size === 0) continue;
		for (const theme of [...declaredThemes].sort()) {
			if (entry.themesWithState.has(theme) || entry.baseHasState) continue;
			findings.push(qualityFinding(
				{ app: "css-guarantee", relativePath: entry.witness.path, content: entry.witness.content },
				{
					category: "css-completeness-state-theme",
					confidence: "high",
					message: `Interactive state "${entry.target}" is styled for theme(s) ${[...entry.themesWithState].sort().join(", ")} but has no [data-theme="${theme}"] variant and no theme-neutral rule — ${theme}-theme users get no visible state answer.`,
					offset: entry.witness.offset,
					severity: "medium",
					snippet: entry.witness.selector
				}
			));
		}
	}
	return findings;
}

// ---------------------------------------------------------------------------
// Check C — critical-property completeness
// ---------------------------------------------------------------------------

/**
 * Merges declarations per (core, theme-context).
 * Contexts: one per declared theme (base merged + theme-scoped), plus a
 * "base" context for cores with no theme scoping at all.
 */
function mergeByCoreTheme(rules, declaredThemes) {
	// core -> { base: Map, themes: Map<theme, Map>, witness }
	const cores = new Map();
	for (const rule of rules) {
		for (const selector of rule.selectors) {
			const info = extractThemeInfo(selector, rule.mediaTheme);
			if (!info.core) continue;
			let entry = cores.get(info.core);
			if (!entry) {
				entry = { base: new Map(), themes: new Map(), witness: null };
				cores.set(info.core, entry);
			}
			// :not([data-theme="X"]) declarations apply to every declared
			// theme except X — merge them into each covered theme bucket.
			const buckets = [];
			if (info.theme) {
				buckets.push(info.theme);
			} else if (info.excludedTheme && declaredThemes.size > 0) {
				for (const t of declaredThemes) {
					if (t !== info.excludedTheme) buckets.push(t);
				}
			}
			if (buckets.length > 0) {
				for (const b of buckets) {
					const target = entry.themes.get(b) || entry.themes.set(b, new Map()).get(b);
					for (const [prop, decl] of rule.declarations) {
						target.set(prop, decl.value);
					}
				}
			} else {
				for (const [prop, decl] of rule.declarations) {
					entry.base.set(prop, decl.value);
				}
			}
			if (!entry.witness) {
				entry.witness = {
					path: rule.path, content: rule.content,
					offset: rule.offset, selector
				};
			}
		}
	}
	return cores;
}

function effectiveDecls(entry, theme) {
	const merged = new Map(entry.base);
	const scoped = entry.themes.get(theme);
	if (scoped) for (const [k, v] of scoped) merged.set(k, v);
	return merged;
}

function resolveColorProp(decls, varTable, theme, ...props) {
	for (const prop of props) {
		if (!decls.has(prop)) continue;
		const resolved = resolveValue(decls.get(prop), theme, varTable);
		if (resolved === null) return { found: true, color: null };
		const color = parseColor(resolved);
		return { found: true, color };
	}
	return { found: false, color: null };
}

function checkCriticalProperties(rules, declaredThemes, varTable) {
	const findings = [];
	const cores = mergeByCoreTheme(rules, declaredThemes);
	const multiTheme = declaredThemes.size >= 2;

	for (const [core, entry] of [...cores.entries()].sort(([a], [b]) => a < b ? -1 : 1)) {
		// When multiple themes are declared, every core is checked in every
		// theme context: var(--x) can resolve differently per theme even when
		// the core itself has no theme-scoped rules (this is exactly how the
		// settings-panel bug hid — hardcoded dark background, theme-variable
		// text color, no light variant anywhere).
		const contexts = multiTheme && declaredThemes.size > 0
			? [...declaredThemes].sort()
			: (entry.themes.size > 0 ? [...entry.themes.keys()] : ["base"]);
		for (const theme of contexts) {
			const themeKey = theme === "base" ? null : theme;
			const decls = effectiveDecls(entry, themeKey);
			const themeLabel = theme === "base" ? "base styles" : `[data-theme="${theme}"]`;

			// --- C1a: transparent text ---
			if (decls.has("color")) {
				const resolved = resolveValue(decls.get("color"), themeKey, varTable);
				const color = resolved === null ? null : parseColor(resolved);
				if (color && color.a === 0) {
					findings.push(makeFinding(entry, "css-completeness-invisible-text", "high",
						`"${core}" (${themeLabel}) sets a fully transparent text color — the text is invisible.`,
						core));
					continue;
				}
			}

			// --- C1b: resolved color/background contrast ---
			const colorRes = resolveColorProp(decls, varTable, themeKey, "color");
			let bgColor = null;
			let bgSet = false;
			if (decls.has("background-color")) {
				bgSet = true;
				const resolved = resolveValue(decls.get("background-color"), themeKey, varTable);
				bgColor = resolved === null ? null : parseColor(resolved);
				if (bgColor && bgColor.a === 0) { bgColor = null; bgSet = false; }
			} else if (decls.has("background")) {
				const resolved = resolveValue(decls.get("background"), themeKey, varTable);
				if (resolved !== null) {
					const kind = backgroundKind(resolved);
					if (kind.kind === "color") { bgSet = true; bgColor = kind.color; if (!isOpaque(bgColor)) { bgColor = null; } }
					else if (kind.kind === "complex") { bgSet = true; bgColor = null; }
					else if (kind.kind === "none") { bgSet = false; }
				}
			}
			if (colorRes.found && isOpaque(colorRes.color) && isOpaque(bgColor)) {
				const ratio = contrastRatio(colorRes.color, bgColor);
				if (ratio !== null && ratio < 1.5) {
					findings.push(makeFinding(entry, "css-completeness-invisible-text", "critical",
						`"${core}" (${themeLabel}) has text/background contrast ${ratio.toFixed(2)} — the text is effectively invisible.`,
						core));
				} else if (ratio !== null && ratio < 3.0) {
					findings.push(makeFinding(entry, "css-completeness-low-contrast", "high",
						`"${core}" (${themeLabel}) has text/background contrast ${ratio.toFixed(2)} (below 3.0) — unreadable for most users.`,
						core));
				}
			}

			// --- C2: background set without explicit text color (multi-theme risk) ---
			// Blocking only for the asymmetric case (color is set for this core
			// in another theme/base but missing here — a genuine omission).
			// When color is never set anywhere for the core, inheritance is the
			// design; report as advisory only.
			if (multiTheme && bgSet && !decls.has("color")) {
				// decls already merges base + this theme, so a missing color here
				// means neither provides it; asymmetric iff another theme does.
				const colorElsewhere = [...entry.themes.entries()]
					.some(([t, m]) => t !== theme && m.has("color"));
				if (colorElsewhere) {
					findings.push(makeFinding(entry, "css-completeness-bg-without-color", "medium",
						`"${core}" (${themeLabel}) sets a background but declares no text color, while color IS declared for this component in another theme — the missing declaration is an omission. Declare color explicitly.`,
						core));
				} else {
					findings.push(makeFinding(entry, "css-completeness-bg-inherits-color", "low",
						`"${core}" (${themeLabel}) sets a background and inherits its text color everywhere — verify the inherited color stays readable in ${themeLabel}.`,
						core));
				}
			}
		}
	}
	return findings;
}

function makeFinding(entry, category, severity, message, snippet) {
	return qualityFinding(
		{ app: "css-guarantee", relativePath: entry.witness.path, content: entry.witness.content },
		{ category, confidence: "high", message, offset: entry.witness.offset, severity, snippet }
	);
}

// ---------------------------------------------------------------------------
// Check D — theme-blind hardcoded dark literals
// ---------------------------------------------------------------------------

/**
 * Catches the exact historical settings-panel bug: a component with NO
 * theme-scoped rules at all hardcodes a very dark opaque literal background
 * plus a light text color in its base styles, in a codebase that declares
 * multiple themes. Selecting the light theme then renders dark-mode colors
 * with no light variant anywhere — nothing conflicts, yet it is broken.
 */
function checkThemeBlindLiterals(rules, declaredThemes, varTable) {
	const findings = [];
	if (declaredThemes.size < 2) return findings;
	// core -> { base: Map, themes: Set, witness } — reuse merge shape.
	const cores = new Map();
	for (const rule of rules) {
		for (const selector of rule.selectors) {
			const info = extractThemeInfo(selector, rule.mediaTheme);
			if (!info.core) continue;
			let entry = cores.get(info.core);
			if (!entry) {
				entry = { base: new Map(), themed: false, witness: null };
				cores.set(info.core, entry);
			}
			if (info.theme || info.excludedTheme) {
				entry.themed = true;
				continue;
			}
			for (const [prop, decl] of rule.declarations) {
				if (!entry.base.has(prop)) entry.base.set(prop, decl.value);
			}
			if (!entry.witness) {
				entry.witness = {
					path: rule.path, content: rule.content,
					offset: rule.offset, selector
				};
			}
		}
	}
	for (const [core, entry] of [...cores.entries()].sort(([a], [b]) => a < b ? -1 : 1)) {
		if (entry.themed || !entry.witness) continue;
		// Opaque (or effectively opaque) literal very-dark background?
		// Alpha >= 0.8 counts: a 92%-opaque navy scrim reads as solid dark.
		let bgColor = null;
		if (entry.base.has("background-color")) {
			const v = entry.base.get("background-color");
			if (!v.trim().startsWith("var(")) bgColor = parseColor(v);
		} else if (entry.base.has("background")) {
			const v = entry.base.get("background");
			if (!v.trim().startsWith("var(")) {
				const kind = backgroundKind(v);
				if (kind.kind === "color") bgColor = kind.color;
			}
		}
		if (!bgColor || bgColor.a < 0.8 || luminance(bgColor) >= 0.08) continue;
		// ...plus a light text color (literal or theme-resolved)?
		let textLum = null;
		if (entry.base.has("color")) {
			const raw = entry.base.get("color");
			const resolved = raw.trim().startsWith("var(")
				? resolveValue(raw, [...declaredThemes][0], varTable)
				: raw;
			const c = resolved === null ? null : parseColor(resolved);
			if (c) textLum = luminance(c);
		}
		if (textLum === null || textLum < 0.35) continue;
		findings.push(makeFinding(entry, "css-completeness-theme-blind", "medium",
			`"${core}" hardcodes a dark-mode appearance (very dark literal background with light text) and has no [data-theme] variants, but this codebase declares themes ${[...declaredThemes].sort().join(" and ")} — selecting the light theme renders these dark styles with no light alternative. Add explicit theme variants or grandfather with a documented reason.`,
			core));
	}
	return findings;
}
