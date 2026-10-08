//B"H
/**
 * @file CSS generator for the Hebrew-First Design System.
 * @description Turns solved Hebrew-first constraints into real CSS. Two parts:
 *  1. The structural foundation (always emitted): RTL default, Latin opt-in
 *     mode, font stacks, anti-clipping guards for taamim, no-break rules for
 *     acronyms/maqaf. This is the "RTL is the default" contract in CSS.
 *  2. Per-value rules from the solved constraint map (dotted path -> value).
 *
 * Hebrew-first authoring uses logical properties: inline-start means "right"
 * in the default RTL context. Physical left/right never appear in generated
 * output except inside the latin-mode opt-in.
 */

import {
	HEBREW_SERIF_STACK,
	HEBREW_SANS_STACK,
	LATIN_SERIF_STACK,
	LINE_HEIGHT_POLICY,
} from "./typography.mjs";
import { LATIN_MODE_SELECTORS } from "./rtl.mjs";

/** Constraint scope -> CSS selector. */
const SCOPE_SELECTORS = {
	root: ":root",
	body: "body",
	sefer: ".sefer",
	hebrew: ".hebrew",
	hebrewTitle: ".hebrew-title",
	hebrewTaamim: ".hebrew--taamim",
	hebrewSans: ".hebrew--sans",
	hebrewAcronym: ".he-acronym",
	hebrewMaqaf: ".he-maqaf",
	english: ".english",
	latin: ".latin",
	latinSerif: ".latin-serif",
	latinMode: LATIN_MODE_SELECTORS.join(", "),
	bdi: "bdi",
	title: ".title",
	content: ".content",
};

/** Constraint property -> CSS property. Hebrew-first prefers logical props. */
const PROP_MAP = {
	direction: "direction",
	fontSize: "font-size",
	lineHeight: "line-height",
	fontFamily: "font-family",
	fontWeight: "font-weight",
	fontStyle: "font-style",
	textAlign: "text-align",
	textTransform: "text-transform",
	color: "color",
	background: "background-color",
	unicodeBidi: "unicode-bidi",
	whiteSpace: "white-space",
	wordSpacing: "word-spacing",
	letterSpacing: "letter-spacing",
	hyphens: "hyphens",
	lineBreak: "line-break",
	overflowWrap: "overflow-wrap",
	overflow: "overflow",
	paddingBlock: "padding-block",
	paddingInlineStart: "padding-inline-start",
	paddingInlineEnd: "padding-inline-end",
	marginBlockStart: "margin-block-start",
	marginBlockEnd: "margin-block-end",
	marginInlineStart: "margin-inline-start",
	marginInlineEnd: "margin-inline-end",
	maxWidth: "max-width",
	// Physical props are rewritten to logical (start = right in RTL default).
	marginLeft: "margin-inline-start",
	marginRight: "margin-inline-end",
	paddingLeft: "padding-inline-start",
	paddingRight: "padding-inline-end",
};

/**
 * Constraint paths that are recognized as declared intent but produce no CSS
 * themselves — the structural foundation already guarantees them.
 */
const RECOGNIZED_NO_CSS = new Set([
	"hebrew.nikkud.clear",
	"hebrew.lineHeight.accommodatesNikkud",
	"hebrew.lineHeight.accommodatesTaamim",
]);

/**
 * Removes one pair of surrounding quotes from a solver-stringified value.
 * "isolate" -> isolate. Leaves non-strings and already-bare values alone.
 */
function unquote(v) {
	if (typeof v !== "string" || v.length < 2) return v;
	const q = v[0];
	if ((q === '"' || q === "'") && v[v.length - 1] === q) return v.slice(1, -1);
	return v;
}

/** Generic font families that must NOT be quoted. */
const GENERIC_FAMILIES = new Set([
	"serif", "sans-serif", "monospace", "cursive", "fantasy",
	"system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "emoji", "fangsong",
]);

/**
 * Formats a font stack for CSS: each multi-word family name gets double
 * quotes; generic families stay bare.
 *   Frank Ruehl CLM, serif  ->  "Frank Ruehl CLM", serif
 */
function formatFontFamily(stack) {
	return String(stack)
		.split(",")
		.map((f) => {
			const name = f.trim().replace(/^["']|["']$/g, "");
			if (!name) return null;
			if (GENERIC_FAMILIES.has(name.toLowerCase())) return name;
			return /\s/.test(name) ? `"${name}"` : name;
		})
		.filter(Boolean)
		.join(", ");
}

/**
 * The structural foundation. Always emitted first. This is the Hebrew-first
 * contract in CSS: RTL default, LTR opt-in, mark-safe typography.
 */
export function structuralCSS() {
	return `/* ── Hebrew-First Design System: structural foundation ──────────────
   RTL is the default. LTR ("latin-mode") is the opt-in exception. */
:root {
  direction: rtl;
  --hebrew-serif: ${HEBREW_SERIF_STACK};
  --hebrew-sans: ${HEBREW_SANS_STACK};
  --latin-serif: ${LATIN_SERIF_STACK};
  --hebrew-lh-plain: ${LINE_HEIGHT_POLICY.plain};
  --hebrew-lh-nikkud: ${LINE_HEIGHT_POLICY.nikkud};
  --hebrew-lh-taamim: ${LINE_HEIGHT_POLICY.taamim};
}

.hebrew {
  direction: rtl;
  font-family: var(--hebrew-serif);
  line-height: var(--hebrew-lh-nikkud);
  text-transform: none; /* never transform sacred text */
  hyphens: none; /* never hyphenate Hebrew words */
  line-break: normal;
  overflow-wrap: normal;
}

/* Taamim tier: cantillation marks render above AND below — never clip them. */
.hebrew--taamim {
  line-height: var(--hebrew-lh-taamim);
  padding-block: 0.12em;
  overflow: visible;
}

/* Latin is the "mode": subtrees opt in explicitly. */
${LATIN_MODE_SELECTORS.join(", ")} {
  direction: ltr;
}
.latin {
  direction: ltr;
  unicode-bidi: isolate;
  font-family: var(--latin-serif);
}
.latin-serif {
  font-family: var(--latin-serif);
}
bdi {
  unicode-bidi: isolate;
}

/* Gershayim acronyms and maqaf-joined words never break across lines. */
.he-acronym,
.he-maqaf {
  white-space: nowrap;
}`;
}

/**
 * Generates CSS from solved Hebrew-first constraint values.
 * @param {Object} values Dotted-path -> value string (from design()).
 * @param {object} [options] { includeStructural: true }.
 * @returns {{css:string, warnings:Array<string>}} CSS text and unmapped paths.
 */
export function generateHebrewCSS(values, options = {}) {
	const { includeStructural = true } = options;
	const warnings = [];
	const rules = new Map(); // selector -> [declarations]

	function addDecl(selector, decl) {
		if (!rules.has(selector)) rules.set(selector, []);
		rules.get(selector).push(decl);
	}

	for (const [path, val] of Object.entries(values)) {
		if (RECOGNIZED_NO_CSS.has(path)) continue; // declared intent, structurally guaranteed

		const parts = path.split(".");
		const prop = parts.pop();
		const scope = parts.join(".");
		// Solver stringifies string values with quotes ("isolate"); CSS needs
		// the bare value (isolate). Unquote exactly one surrounding pair.
		const cssVal = unquote(val);

		// Special: english.position = below(hebrew) -> block flow under Hebrew.
		if (prop === "position" && typeof cssVal === "string" && cssVal.startsWith("below(")) {
			const selector = SCOPE_SELECTORS[scope];
			if (selector) addDecl(selector, "display: block; /* below() — stacked under Hebrew, never beside */");
			else warnings.push(`No selector for scope '${scope}' (path '${path}')`);
			continue;
		}

		const selector = SCOPE_SELECTORS[scope];
		const cssProp = PROP_MAP[prop];
		if (!selector) {
			warnings.push(`No selector for scope '${scope}' (path '${path}')`);
			continue;
		}
		if (!cssProp) {
			warnings.push(`No CSS property for '${prop}' (path '${path}')`);
			continue;
		}
		addDecl(selector, `${cssProp}: ${cssProp === "font-family" ? formatFontFamily(cssVal) : cssVal};`);
	}

	const chunks = [];
	if (includeStructural) chunks.push(structuralCSS());
	for (const [selector, decls] of rules) {
		chunks.push(`${selector} {\n${decls.map((d) => `  ${d}`).join("\n")}\n}`);
	}
	return { css: chunks.join("\n\n") + "\n", warnings };
}
