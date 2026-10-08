//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Pre-built constraint library for the Awtsmoos Design OS.
 * @description 100 ready-made constraints covering typography, color, layout,
 * Hebrew-specific rules, spacing, and interactive states. Each entry is a named
 * bundle of constraint DSL source that can be included wholesale.
 *
 * Usage:
 *   import { LIBRARY, getBundle, listBundles } from "./library.mjs";
 *   const src = getBundle("sefer-light-theme"); // DSL source text
 */

/**
 * One bundle: { name, category, description, source }.
 * Source is constraint-DSL text (parse with parser.mjs).
 */
const BUNDLES = [
	// ─── Typography (20) ──────────────────────────────────────────────
	{
		name: "type-scale-4x",
		category: "typography",
		description: "Sefer body text at 4x base: title 4x body, section 2x body.",
		source: `
body.fontSize = 16px
title.fontSize = 4 * body.fontSize
section.fontSize = 2 * body.fontSize
footnote.fontSize = 0.85 * body.fontSize
`.trim(),
	},
	{
		name: "type-line-height",
		category: "typography",
		description: "Comfortable line heights proportional to font size.",
		source: `
body.lineHeight = 1.7 * body.fontSize
title.lineHeight = 1.25 * title.fontSize
section.lineHeight = 1.5 * section.fontSize
`.trim(),
	},
	{
		name: "type-weights",
		category: "typography",
		description: "Weight hierarchy: title bold, body normal, captions light.",
		source: `
title.fontWeight = 700
body.fontWeight = 400
caption.fontWeight = 300
title.fontWeight > body.fontWeight
`.trim(),
	},
	{
		name: "type-max-measure",
		category: "typography",
		description: "Line length capped for readability (45-75 chars ≈ 34em).",
		source: `
body.maxWidth = 34em
body.maxWidth <= 75ch
`.trim(),
	},
	{
		name: "type-hebrew-serif",
		category: "typography",
		description: "Hebrew body in serif, English in matching serif.",
		source: `
hebrew.fontFamily = serif
english.fontFamily = serif
`.trim(),
	},
	{
		name: "type-min-size",
		category: "typography",
		description: "No text smaller than 12px (accessibility floor).",
		source: `
body.fontSize >= 12px
footnote.fontSize >= 12px
caption.fontSize >= 12px
`.trim(),
	},
	{
		name: "type-heading-scale",
		category: "typography",
		description: "h1 > h2 > h3 > body strict size ordering.",
		source: `
h1.fontSize = 2.5 * body.fontSize
h2.fontSize = 2 * body.fontSize
h3.fontSize = 1.5 * body.fontSize
h1.fontSize > h2.fontSize
h2.fontSize > h3.fontSize
h3.fontSize > body.fontSize
`.trim(),
	},
	{
		name: "type-letter-spacing",
		category: "typography",
		description: "Slight tracking on titles, none on body.",
		source: `
title.letterSpacing = 0.02em
body.letterSpacing = 0em
`.trim(),
	},
	{
		name: "type-english-under-hebrew",
		category: "typography",
		description: "English translation sits under Hebrew, slightly smaller.",
		source: `
english.fontSize = 0.9 * hebrew.fontSize
english.position = below(hebrew)
`.trim(),
	},
	{
		name: "type-verse-numbers",
		category: "typography",
		description: "Verse numbers small and superscript-adjacent.",
		source: `
verseNumber.fontSize = 0.7 * body.fontSize
verseNumber.fontWeight = 700
`.trim(),
	},
	{
		name: "type-quote-style",
		category: "typography",
		description: "Block quotes indented and italic.",
		source: `
quote.fontStyle = italic
quote.marginLeft = 2em
`.trim(),
	},
	{
		name: "type-code-mono",
		category: "typography",
		description: "Code spans in monospace.",
		source: `
code.fontFamily = mono
`.trim(),
	},
	{
		name: "type-small-caps-titles",
		category: "typography",
		description: "Section labels in small caps style via letter spacing.",
		source: `
sectionLabel.letterSpacing = 0.1em
sectionLabel.fontWeight = 700
`.trim(),
	},
	{
		name: "type-footnote-markers",
		category: "typography",
		description: "Footnote markers superscript-sized and bold.",
		source: `
fnMarker.fontSize = 0.65 * body.fontSize
fnMarker.fontWeight = 700
`.trim(),
	},
	{
		name: "type-qa-questions",
		category: "typography",
		description: "Q&A questions bold, answers normal.",
		source: `
qa.question.fontWeight = 700
qa.answer.fontWeight = 400
`.trim(),
	},
	{
		name: "type-no-orphan-size",
		category: "typography",
		description: "Titles never smaller than body.",
		source: `
title.fontSize >= body.fontSize
`.trim(),
	},
	{
		name: "type-responsive-scale",
		category: "typography",
		description: "Type scales down gracefully on narrow screens.",
		source: `
layout.width in [375, 1920]
body.fontSize >= 14px
`.trim(),
	},
	{
		name: "type-tabular-numbers",
		category: "typography",
		description: "Footnote numbers use tabular figures for alignment.",
		source: `
fnMarker.fontVariantNumeric = "tabular-nums"
`.trim(),
	},
	{
		name: "type-title-balance",
		category: "typography",
		description: "Long titles wrap balanced.",
		source: `
title.textWrap = "balance"
`.trim(),
	},
	{
		name: "type-body-measure-range",
		category: "typography",
		description: "Body measure within readable range.",
		source: `
body.maxWidth in [30em, 40em]
`.trim(),
	},

	// ─── Color (20) ───────────────────────────────────────────────────
	{
		name: "sefer-light-theme",
		category: "color",
		description: "Warm paper light theme: dark brown ink on cream.",
		source: `
sefer.background = #fffdf6
sefer.color = #2b2118
contrast(sefer.color, sefer.background) >= 7.0
`.trim(),
	},
	{
		name: "sefer-dark-theme",
		category: "color",
		description: "Dark theme: warm cream ink on deep brown.",
		source: `
seferDark.background = #1a1410
seferDark.color = #f5ead6
contrast(seferDark.color, seferDark.background) >= 7.0
`.trim(),
	},
	{
		name: "color-contrast-aa",
		category: "color",
		description: "WCAG AA: all body text contrast >= 4.5.",
		source: `
contrast(body.color, body.background) >= 4.5
`.trim(),
	},
	{
		name: "color-contrast-aaa",
		category: "color",
		description: "WCAG AAA: titles contrast >= 7.0.",
		source: `
contrast(title.color, title.background) >= 7.0
`.trim(),
	},
	{
		name: "color-never-white-on-white",
		category: "color",
		description: "The white-on-white guard: fg and bg must differ strongly.",
		source: `
contrast(text.color, text.background) >= 4.5
`.trim(),
	},
	{
		name: "color-link",
		category: "color",
		description: "Links distinguishable with strong contrast.",
		source: `
link.color = #1a5fb4
contrast(link.color, body.background) >= 4.5
`.trim(),
	},
	{
		name: "color-link-dark",
		category: "color",
		description: "Link color for dark backgrounds.",
		source: `
linkDark.color = #8ab4f8
contrast(linkDark.color, seferDark.background) >= 4.5
`.trim(),
	},
	{
		name: "color-accent",
		category: "color",
		description: "Accent derived from ink, darkened for emphasis.",
		source: `
accent.color = darken(sefer.color, 10)
`.trim(),
	},
	{
		name: "color-muted",
		category: "color",
		description: "Muted text lightened from ink but still AA.",
		source: `
muted.color = lighten(sefer.color, 35)
contrast(muted.color, sefer.background) >= 4.5
`.trim(),
	},
	{
		name: "color-border",
		category: "color",
		description: "Borders mix ink and background.",
		source: `
border.color = mix(sefer.color, sefer.background, 25)
`.trim(),
	},
	{
		name: "color-highlight-bg",
		category: "color",
		description: "Highlight background: warm tint of paper.",
		source: `
highlight.background = #fdf6e3
contrast(sefer.color, highlight.background) >= 7.0
`.trim(),
	},
	{
		name: "color-footnote-rule",
		category: "color",
		description: "Footnote separator rule color.",
		source: `
fnRule.color = mix(sefer.color, sefer.background, 40)
`.trim(),
	},
	{
		name: "color-button-primary",
		category: "color",
		description: "Primary button: ink background, paper text.",
		source: `
btnPrimary.background = #2b2118
btnPrimary.color = #fffdf6
contrast(btnPrimary.color, btnPrimary.background) >= 7.0
`.trim(),
	},
	{
		name: "color-focus-ring",
		category: "color",
		description: "Focus ring highly visible on both themes.",
		source: `
focus.ringColor = #b3541e
`.trim(),
	},
	{
		name: "color-error",
		category: "color",
		description: "Error text with sufficient contrast.",
		source: `
error.color = #a51a1a
contrast(error.color, sefer.background) >= 4.5
`.trim(),
	},
	{
		name: "color-success",
		category: "color",
		description: "Success text with sufficient contrast.",
		source: `
success.color = #1a6b3c
contrast(success.color, sefer.background) >= 4.5
`.trim(),
	},
	{
		name: "color-luminance-floor",
		category: "color",
		description: "Background never too dark for light theme.",
		source: `
luminance(sefer.background) >= 0.85
`.trim(),
	},
	{
		name: "color-no-pure-black",
		category: "color",
		description: "Warm ink instead of pure black (softer).",
		source: `
sefer.color = #2b2118
`.trim(),
	},
	{
		name: "color-hover-darken",
		category: "color",
		description: "Hover states darken interactive elements.",
		source: `
btnHover.background = darken(btnPrimary.background, 8)
`.trim(),
	},
	{
		name: "color-separator",
		category: "color",
		description: "Dashed Hebrew/English separator color.",
		source: `
separator.color = mix(sefer.color, sefer.background, 50)
`.trim(),
	},

	// ─── Layout (20) ────────────────────────────────────────────────
	{
		name: "layout-page-width",
		category: "layout",
		description: "Page width within device range.",
		source: `
layout.width in [375, 1920]
`.trim(),
	},
	{
		name: "layout-content-max",
		category: "layout",
		description: "Content column max width.",
		source: `
content.maxWidth = 720px
`.trim(),
	},
	{
		name: "layout-centered",
		category: "layout",
		description: "Content centered with auto margins.",
		source: `
content.marginLeft = auto
content.marginRight = auto
`.trim(),
	},
	{
		name: "layout-stacked",
		category: "layout",
		description: "Hebrew above English: never side by side.",
		source: `
english.position = below(hebrew)
`.trim(),
	},
	{
		name: "layout-section-spacing",
		category: "layout",
		description: "Sections separated by generous space.",
		source: `
section.marginTop = 2.5 * body.fontSize
section.marginBottom = 2.5 * body.fontSize
`.trim(),
	},
	{
		name: "layout-paragraph-spacing",
		category: "layout",
		description: "Paragraph rhythm.",
		source: `
paragraph.marginBottom = 1 * body.fontSize
`.trim(),
	},
	{
		name: "layout-title-margins",
		category: "layout",
		description: "Title breathing room.",
		source: `
title.marginTop = 2 * body.fontSize
title.marginBottom = 1 * body.fontSize
`.trim(),
	},
	{
		name: "layout-no-horizontal-scroll",
		category: "layout",
		description: "Content never exceeds viewport width.",
		source: `
content.maxWidth <= layout.width
`.trim(),
	},
	{
		name: "layout-padding",
		category: "layout",
		description: "Page padding scales with viewport.",
		source: `
page.paddingLeft = 16px
page.paddingRight = 16px
page.paddingLeft >= 12px
`.trim(),
	},
	{
		name: "layout-footnotes-separate",
		category: "layout",
		description: "Footnotes visually separated from body.",
		source: `
footnotes.marginTop = 3 * body.fontSize
footnotes.borderTop = "1px solid"
`.trim(),
	},
	{
		name: "layout-qa-spacing",
		category: "layout",
		description: "Q&A pairs spaced clearly.",
		source: `
qa.marginBottom = 1.5 * body.fontSize
`.trim(),
	},
	{
		name: "layout-header-sticky",
		category: "layout",
		description: "Reader header height.",
		source: `
header.height = 56px
`.trim(),
	},
	{
		name: "layout-sidebar-width",
		category: "layout",
		description: "Sidebar within reasonable width.",
		source: `
sidebar.width in [240px, 360px]
`.trim(),
	},
	{
		name: "layout-mobile-single-column",
		category: "layout",
		description: "Single column below 768px.",
		source: `
layout.width >= 375px
content.columns = 1
`.trim(),
	},
	{
		name: "layout-verse-indent",
		category: "layout",
		description: "Verse text indented from number.",
		source: `
verse.textIndent = 1.5em
`.trim(),
	},
	{
		name: "layout-separator-margins",
		category: "layout",
		description: "Dashed separator margins.",
		source: `
separator.marginTop = 1 * body.fontSize
separator.marginBottom = 1 * body.fontSize
`.trim(),
	},
	{
		name: "layout-summary-box",
		category: "layout",
		description: "Summary callout box padding.",
		source: `
summary.padding = 16px
summary.marginBottom = 2 * body.fontSize
`.trim(),
	},
	{
		name: "layout-min-touch",
		category: "layout",
		description: "Interactive elements at least 44px targets.",
		source: `
button.minHeight = 44px
button.minWidth = 44px
`.trim(),
	},
	{
		name: "layout-max-touch",
		category: "layout",
		description: "Touch targets not absurdly large.",
		source: `
button.minHeight <= 96px
`.trim(),
	},
	{
		name: "layout-content-gutter",
		category: "layout",
		description: "Gutter between content and viewport edge.",
		source: `
content.gutter = 16px
content.gutter >= 12px
`.trim(),
	},

	// ─── Hebrew-specific (20) ───────────────────────────────────────
	{
		name: "hebrew-rtl",
		category: "hebrew",
		description: "Hebrew text flows right to left.",
		source: `
hebrew.direction = rtl
`.trim(),
	},
	{
		name: "hebrew-english-ltr",
		category: "hebrew",
		description: "English translation flows left to right.",
		source: `
english.direction = ltr
`.trim(),
	},
	{
		name: "hebrew-no-side-by-side",
		category: "hebrew",
		description: "Yaakov's rule: English UNDER Hebrew, never beside.",
		source: `
english.position = below(hebrew)
`.trim(),
	},
	{
		name: "hebrew-phrase-keep",
		category: "hebrew",
		description: "Sacred phrases stay together (no line break inside).",
		source: `
phrase.keepTogether = true
`.trim(),
	},
	{
		name: "hebrew-nikkud-size",
		category: "hebrew",
		description: "Vowel points legible: line height accommodates nikkud.",
		source: `
hebrew.lineHeight >= 1.7 * hebrew.fontSize
`.trim(),
	},
	{
		name: "hebrew-taamim-space",
		category: "hebrew",
		description: "Cantillation marks need vertical room.",
		source: `
hebrewTaamim.lineHeight >= 1.8 * hebrew.fontSize
`.trim(),
	},
	{
		name: "hebrew-font-serif",
		category: "hebrew",
		description: "Traditional serif for sacred text.",
		source: `
hebrew.fontFamily = serif
`.trim(),
	},
	{
		name: "hebrew-title-size",
		category: "hebrew",
		description: "Hebrew titles prominent.",
		source: `
hebrewTitle.fontSize = 2 * hebrew.fontSize
`.trim(),
	},
	{
		name: "hebrew-body-size",
		category: "hebrew",
		description: "Hebrew body at 4x base per sefer spec.",
		source: `
hebrew.fontSize = 4 * base.fontSize
`.trim(),
	},
	{
		name: "hebrew-justify",
		category: "hebrew",
		description: "Hebrew body justified like a sefer.",
		source: `
hebrew.textAlign = justify
`.trim(),
	},
	{
		name: "hebrew-no-hyphen",
		category: "hebrew",
		description: "Never hyphenate Hebrew words.",
		source: `
hebrew.hyphens = none
`.trim(),
	},
	{
		name: "hebrew-punctuation",
		category: "hebrew",
		description: "Hebrew punctuation (geresh, gershayim) sized with text.",
		source: `
hebrewPunct.fontSize = 1 * hebrew.fontSize
`.trim(),
	},
	{
		name: "hebrew-bracket-phrase",
		category: "hebrew",
		description: "Bracket opens a phrase, bracket closes it (phrase rule).",
		source: `
phrase.bracketOpen = true
`.trim(),
	},
	{
		name: "hebrew-source-cite",
		category: "hebrew",
		description: "Source citations smaller than body.",
		source: `
citation.fontSize = 0.85 * hebrew.fontSize
`.trim(),
	},
	{
		name: "hebrew-dibbur",
		category: "hebrew",
		description: "Dibbur hamatchil bold.",
		source: `
dibbur.fontWeight = 700
`.trim(),
	},
	{
		name: "hebrew-english-separator",
		category: "hebrew",
		description: "Dashed separator between Hebrew and English.",
		source: `
hebrewEnglish.separator = "dashed"
`.trim(),
	},
	{
		name: "hebrew-footnote-markers",
		category: "hebrew",
		description: "Hebrew footnote markers superscript.",
		source: `
hebrewFn.fontSize = 0.65 * hebrew.fontSize
`.trim(),
	},
	{
		name: "hebrew-line-max",
		category: "hebrew",
		description: "Hebrew lines not too long.",
		source: `
hebrew.maxWidth = 34em
`.trim(),
	},
	{
		name: "hebrew-contrast",
		category: "hebrew",
		description: "Hebrew text AAA contrast on paper.",
		source: `
contrast(hebrew.color, hebrew.background) >= 7.0
`.trim(),
	},
	{
		name: "hebrew-spacing-words",
		category: "hebrew",
		description: "Word spacing comfortable for Hebrew.",
		source: `
hebrew.wordSpacing = 0.1em
`.trim(),
	},

	// ─── Spacing (10) ───────────────────────────────────────────────
	{
		name: "space-scale",
		category: "spacing",
		description: "Spacing scale based on body font size.",
		source: `
space.xs = 0.25 * body.fontSize
space.sm = 0.5 * body.fontSize
space.md = 1 * body.fontSize
space.lg = 2 * body.fontSize
space.xl = 4 * body.fontSize
`.trim(),
	},
	{
		name: "space-section",
		category: "spacing",
		description: "Between numbered sections.",
		source: `
sectionGap.margin = 2.5 * body.fontSize
`.trim(),
	},
	{
		name: "space-paragraph",
		category: "spacing",
		description: "Between paragraphs.",
		source: `
paragraphGap.margin = 1 * body.fontSize
`.trim(),
	},
	{
		name: "space-list",
		category: "spacing",
		description: "List item spacing.",
		source: `
listItem.marginBottom = 0.5 * body.fontSize
`.trim(),
	},
	{
		name: "space-heading-before",
		category: "spacing",
		description: "Space before headings.",
		source: `
heading.marginTop = 2 * body.fontSize
`.trim(),
	},
	{
		name: "space-heading-after",
		category: "spacing",
		description: "Space after headings.",
		source: `
heading.marginBottom = 1 * body.fontSize
`.trim(),
	},
	{
		name: "space-button-padding",
		category: "spacing",
		description: "Button internal padding.",
		source: `
button.paddingLeft = 16px
button.paddingRight = 16px
button.paddingTop = 10px
button.paddingBottom = 10px
`.trim(),
	},
	{
		name: "space-card-padding",
		category: "spacing",
		description: "Card internal padding.",
		source: `
card.padding = 20px
`.trim(),
	},
	{
		name: "space-min-separation",
		category: "spacing",
		description: "Minimum separation between blocks.",
		source: `
block.marginBottom >= 0.5 * body.fontSize
`.trim(),
	},
	{
		name: "space-max-separation",
		category: "spacing",
		description: "Maximum separation sanity cap.",
		source: `
block.marginBottom <= 6 * body.fontSize
`.trim(),
	},

	// ─── Interactive (10) ───────────────────────────────────────────
	{
		name: "interactive-hover",
		category: "interactive",
		description: "Every button has a hover state.",
		source: `
buttonHover.background = darken(button.background, 8)
`.trim(),
	},
	{
		name: "interactive-active",
		category: "interactive",
		description: "Every button has an active (pressed) state.",
		source: `
buttonActive.transform = "scale(0.98)"
`.trim(),
	},
	{
		name: "interactive-focus",
		category: "interactive",
		description: "Every interactive element has a visible focus ring.",
		source: `
focus.outlineWidth = 2px
focus.outlineColor = #b3541e
`.trim(),
	},
	{
		name: "interactive-focus-visible",
		category: "interactive",
		description: "Focus-visible matches focus.",
		source: `
focusVisible.outlineWidth = 2px
`.trim(),
	},
	{
		name: "interactive-transition",
		category: "interactive",
		description: "State changes animate smoothly.",
		source: `
button.transition = "all 0.15s ease"
`.trim(),
	},
	{
		name: "interactive-cursor",
		category: "interactive",
		description: "Buttons show pointer cursor.",
		source: `
button.cursor = "pointer"
`.trim(),
	},
	{
		name: "interactive-disabled",
		category: "interactive",
		description: "Disabled state distinguishable.",
		source: `
buttonDisabled.opacity = 0.5
`.trim(),
	},
	{
		name: "interactive-touch-target",
		category: "interactive",
		description: "WCAG touch target minimum.",
		source: `
button.minWidth = 44px
button.minHeight = 44px
`.trim(),
	},
	{
		name: "interactive-link-underline",
		category: "interactive",
		description: "Links underlined on hover.",
		source: `
linkHover.textDecoration = "underline"
`.trim(),
	},
	{
		name: "interactive-footnote-button",
		category: "interactive",
		description: "Footnote markers are real buttons with states.",
		source: `
fnMarker.minWidth = 44px
fnMarker.minHeight = 44px
fnMarkerHover.background = darken(fnMarker.background, 10)
`.trim(),
	},
];

/** All bundles. */
export const LIBRARY = Object.freeze(BUNDLES.map((b) => Object.freeze({ ...b })));

/** Categories present in the library. */
export const CATEGORIES = Object.freeze([...new Set(BUNDLES.map((b) => b.category))]);

/**
 * Returns the DSL source for a bundle by name.
 * @param {string} name Bundle name.
 * @returns {string} DSL source.
 * @throws {Error} If not found.
 */
export function getBundle(name) {
	const b = BUNDLES.find((x) => x.name === name);
	if (!b) throw new Error(`Unknown constraint bundle '${name}'`);
	return b.source;
}

/** Lists bundle names, optionally filtered by category. */
export function listBundles(category = null) {
	return BUNDLES
		.filter((b) => !category || b.category === category)
		.map((b) => b.name);
}

/** Returns bundle metadata (without source) for a category. */
export function describeBundles(category = null) {
	return BUNDLES
		.filter((b) => !category || b.category === category)
		.map((b) => ({ name: b.name, category: b.category, description: b.description }));
}

/** Total bundle count (should be 100). */
export const BUNDLE_COUNT = BUNDLES.length;
