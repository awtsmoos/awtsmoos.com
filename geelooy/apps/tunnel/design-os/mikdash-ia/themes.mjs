//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Visual language per Mikdash level, as constraint-DSL bundles.
 * @description Each level gets a theme: a named bundle of constraint-DSL
 * source that the Design OS solver can turn into concrete values, plus a
 * token table for direct use. Sanctity increases with level: chrome falls
 * away, focus deepens, warmth deepens.
 *
 * Ascent: shaar → azarah → heichal → kodesh.
 */

// ─── DSL bundles (validated against the constraint parser) ───────────────

/** Level 1 — Shaar: welcoming, bright, generous, directs inward. */
export const SHAAR_THEME_DSL = `
body.fontSize = 18px
body.lineHeight = 1.6 * body.fontSize
title.fontSize = 3 * body.fontSize
title.lineHeight = 1.2 * title.fontSize
section.gap = 3 * body.fontSize
body.maxWidth = 42em
body.background = #fdfbf5
body.color = #3a2f23
title.background = #fdfbf5
title.color = #2b2118
contrast(body.color, body.background) >= 4.5
contrast(title.color, title.background) >= 7.0
`.trim();

/** Level 2 — Azarah: open, scannable, many doors. */
export const AZARAH_THEME_DSL = `
body.fontSize = 16px
body.lineHeight = 1.6 * body.fontSize
cardtitle.fontSize = 1.3 * body.fontSize
cardtitle.lineHeight = 1.35 * cardtitle.fontSize
card.gap = 1.5 * body.fontSize
body.maxWidth = 64em
body.background = #faf6ec
body.color = #3a2f23
cardtitle.background = #faf6ec
cardtitle.color = #2b2118
contrast(body.color, body.background) >= 4.5
contrast(cardtitle.color, cardtitle.background) >= 4.5
`.trim();

/** Level 3 — Heichal: the sefer reader. Warm paper, 4x type, English under Hebrew. */
export const HEICHAL_THEME_DSL = `
body.fontSize = 16px
body.lineHeight = 1.7 * body.fontSize
title.fontSize = 4 * body.fontSize
title.lineHeight = 1.25 * title.fontSize
section.fontSize = 2 * body.fontSize
footnote.fontSize = 0.85 * body.fontSize
body.maxWidth = 34em
english.position = below(hebrew)
body.background = #f7f1e3
body.color = #2b2118
title.background = #f7f1e3
title.color = #1f1712
contrast(body.color, body.background) >= 7.0
contrast(title.color, title.background) >= 7.0
`.trim();

/** Level 4 — Kodesh HaKodashim: larger, narrower, stiller. Nothing but text. */
export const KODESH_THEME_DSL = `
body.fontSize = 18px
body.lineHeight = 1.8 * body.fontSize
title.fontSize = 4.5 * body.fontSize
title.lineHeight = 1.2 * title.fontSize
body.maxWidth = 30em
english.position = below(hebrew)
chrome.count = 0
body.background = #f3ecd9
body.color = #1a1410
title.background = #f3ecd9
title.color = #14100c
contrast(body.color, body.background) >= 7.0
contrast(title.color, title.background) >= 7.0
`.trim();

export const THEME_DSL_BY_LEVEL = Object.freeze({
	shaar: SHAAR_THEME_DSL,
	azarah: AZARAH_THEME_DSL,
	heichal: HEICHAL_THEME_DSL,
	kodesh: KODESH_THEME_DSL,
});

/** Get the DSL bundle for a level id. Throws on unknown level. */
export function themeDsl(levelId) {
	const dsl = THEME_DSL_BY_LEVEL[levelId];
	if (!dsl) throw new Error(`Unknown Mikdash level '${levelId}'`);
	return dsl;
}

// ─── Token tables (direct use, no solving needed) ─────────────────────────

export const TOKENS = Object.freeze({
	shaar: {
		background: "#fdfbf5",
		ink: "#3a2f23",
		accent: "#b98a2f",
		titleInk: "#2b2118",
		fontFamily: "serif",
		chrome: ["header", "hero", "nav", "cta-row", "footer"],
	},
	azarah: {
		background: "#faf6ec",
		ink: "#3a2f23",
		accent: "#a67c2e",
		titleInk: "#2b2118",
		fontFamily: "serif",
		chrome: ["header", "nav", "filter-bar", "card-grid", "footer"],
	},
	heichal: {
		background: "#f7f1e3",
		ink: "#2b2118",
		accent: "#8a6a2a",
		titleInk: "#1f1712",
		fontFamily: "serif",
		chrome: ["slim-header", "reader-controls"],
	},
	kodesh: {
		background: "#f3ecd9",
		ink: "#1a1410",
		accent: "#8a6a2a",
		titleInk: "#14100c",
		fontFamily: "serif",
		chrome: ["quiet-return"],
	},
});

/** Token table for a level id. Throws on unknown level. */
export function tokens(levelId) {
	const t = TOKENS[levelId];
	if (!t) throw new Error(`Unknown Mikdash level '${levelId}'`);
	return t;
}

/**
 * CSS custom-property block for a level, e.g. for a <style> tag.
 * @param {string} levelId
 */
export function themeCssVars(levelId) {
	const t = tokens(levelId);
	return [
		`:root[data-mikdash-level="${levelId}"] {`,
		`  --mikdash-bg: ${t.background};`,
		`  --mikdash-ink: ${t.ink};`,
		`  --mikdash-accent: ${t.accent};`,
		`  --mikdash-title-ink: ${t.titleInk};`,
		`  --mikdash-font: ${t.fontFamily};`,
		`}`,
	].join("\n");
}
