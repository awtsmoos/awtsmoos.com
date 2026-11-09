//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Yom Tov stylesheets.
 * @description Theme CSS per Yom Tov mode. On freeze days (Pesach, Sukkot,
 * Shavuot, Yamim Noraim) the page ALSO carries .shabbos-mode, so the sibling
 * shabbos-mode stylesheet provides the stillness; this module only re-tints
 * the palette variables and adds the holiday's mood. On theme-only days
 * (Chanukah, Purim, Chol HaMoed, fasts, minor days) yomtovSurfaceCss gives a
 * complete standalone reading surface — beautiful, fully interactive.
 *
 * yomtovThemeCss(mode, opts) -> palette + mood overrides
 * yomtovSurfaceCss(opts)     -> standalone surface for non-freeze days
 */

import { themeFor } from "./themes.mjs";

export const YOMTOV_CLASS = "yomtov-mode";

/**
 * Palette + mood overrides for one mode. Scoped .yomtov-mode.yomtov-<mode>.
 * On freeze days this layers over the shabbos-mode base (re-tinting its
 * --shabbos-* variables); on theme-only days it layers over yomtovSurfaceCss.
 */
export function yomtovThemeCss(mode, opts = {}) {
	const t = themeFor(mode);
	const S = `.${YOMTOV_CLASS}.yomtov-${mode}`;
	const p = Object.assign({}, t.palette, opts.palette || {});
	return `/* B"H — Yom Tov theme: ${t.en}. Not degraded: designed. */
${S} {
	--yomtov-paper: ${p.paper};
	--yomtov-ink: ${p.ink};
	--yomtov-accent: ${p.accent};
	--yomtov-muted: ${p.muted};
	--shabbos-paper: ${p.paper};
	--shabbos-ink: ${p.ink};
	--shabbos-accent: ${p.accent};
	--shabbos-muted: ${p.muted};
}
${moodCss(S, t.mood, p)}
${S} .yomtov-notice.yomtov-notice {
	display: block;
	text-align: center;
	padding: 1.1em 1em 1em;
	margin: 0 0 2em;
	border-top: 4px double ${p.accent};
	border-bottom: 1px solid ${p.accent};
	background: ${p.paper};
	color: ${p.muted};
	font-style: italic;
	letter-spacing: 0.06em;
	line-height: 1.7;
}
${S} .yomtov-notice .yomtov-emoji { font-style: normal; font-size: 1.4em; }
${S} .yomtov-notice .yomtov-title { color: ${p.ink}; font-style: normal; letter-spacing: 0.04em; }
`;
}

/** Mood-specific flourishes per theme. */
function moodCss(S, mood, p) {
	switch (mood) {
		case "stark": // Pesach: pure, no clutter
			return `${S}${S} h1, ${S}${S} h2 { letter-spacing: 0.08em; }
${S}${S} h1::after { width: 3em; border-bottom-width: 1px; }
${S}${S} body { background-image: none; }`;
		case "airy": // Sukkot: open sky
			return `${S}${S} main, ${S}${S} article { padding-top: 4rem; }
${S}${S} h1::after { border-bottom-style: dotted; }`;
		case "lush": // Shavuot: harvest richness
			return `${S}${S} h1, ${S}${S} h2 { color: ${p.accent}; }
${S}${S} blockquote { border-inline-start: 3px solid ${p.accent}; }`;
		case "solemn": // Yamim Noraim: quiet gravity
			return `${S}${S} h1, ${S}${S} h2, ${S}${S} h3 { letter-spacing: 0.05em; font-weight: 500; }
${S}${S} body { line-height: 2; }`;
		case "luminous": // Chanukah: light in darkness
			return `${S}${S} h1 { color: ${p.accent}; text-shadow: 0 0 24px ${p.accent}55; }
${S}${S} body { background: radial-gradient(ellipse at 50% 0%, #1a2650 0%, ${p.paper} 70%); }
${S}${S} .yomtov-notice.yomtov-notice { background: transparent; }`;
		case "joyful": // Purim: gladness, tasteful
			return `${S}${S} h1::after { border-bottom: 3px double ${p.accent}; width: 5em; }`;
		case "subdued": // Fast days: grey quiet
			return `${S}${S} img { filter: grayscale(0.6); }
${S}${S} h1, ${S}${S} h2 { font-weight: 500; }`;
		case "gentle": // Minor days: soft
		default:
			return `${S}${S} h1::after { width: 3em; }`;
	}
}

/**
 * Standalone reading surface for theme-only days (no freeze): warm paper,
 * sefer typography, centered column. Scoped .yomtov-mode (any mode).
 */
export function yomtovSurfaceCss(opts = {}) {
	const S = `.${YOMTOV_CLASS}`;
	return `/* B"H — Yom Tov surface: a beautiful page for a holy day. */
${S}${S} body {
	background: var(--yomtov-paper, #faf7ef);
	color: var(--yomtov-ink, #33302a);
	font-family: Georgia, "Times New Roman", "Noto Serif Hebrew", "Frank Ruhl Libre", serif;
	line-height: 1.85;
	font-size: 1.12em;
}
${S}${S} main, ${S}${S} article, ${S}${S} .content.content, ${S}${S} .post-body.post-body {
	max-width: 42em;
	margin-left: auto;
	margin-right: auto;
	padding: 2.5rem 1.5rem;
	float: none;
}
${S}${S} h1, ${S}${S} h2, ${S}${S} h3 { color: var(--yomtov-ink, #33302a); line-height: 1.4; }
${S}${S} h1 { font-size: 1.9em; text-align: center; }
${S}${S} [lang="he"][lang="he"], ${S}${S} .hebrew.hebrew { font-size: 1.22em; line-height: 1.95; }
${S}${S} a { color: var(--yomtov-accent, #7a6a3f); }
${S}${S} .only-yomtov.only-yomtov { display: block; }
${S}${S} .only-weekday.only-weekday { display: none; }
`;
}
