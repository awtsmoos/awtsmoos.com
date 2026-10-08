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
${S} .yomtov-notice {
	display: block !important;
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
			return `${S} h1, ${S} h2 { letter-spacing: 0.08em !important; }
${S} h1::after { width: 3em !important; border-bottom-width: 1px !important; }
${S} body { background-image: none !important; }`;
		case "airy": // Sukkot: open sky
			return `${S} main, ${S} article { padding-top: 4rem !important; }
${S} h1::after { border-bottom-style: dotted !important; }`;
		case "lush": // Shavuot: harvest richness
			return `${S} h1, ${S} h2 { color: ${p.accent} !important; }
${S} blockquote { border-inline-start: 3px solid ${p.accent} !important; }`;
		case "solemn": // Yamim Noraim: quiet gravity
			return `${S} h1, ${S} h2, ${S} h3 { letter-spacing: 0.05em !important; font-weight: 500 !important; }
${S} body { line-height: 2 !important; }`;
		case "luminous": // Chanukah: light in darkness
			return `${S} h1 { color: ${p.accent} !important; text-shadow: 0 0 24px ${p.accent}55 !important; }
${S} body { background: radial-gradient(ellipse at 50% 0%, #1a2650 0%, ${p.paper} 70%) !important; }
${S} .yomtov-notice { background: transparent !important; }`;
		case "joyful": // Purim: gladness, tasteful
			return `${S} h1::after { border-bottom: 3px double ${p.accent} !important; width: 5em !important; }`;
		case "subdued": // Fast days: grey quiet
			return `${S} img { filter: grayscale(0.6) !important; }
${S} h1, ${S} h2 { font-weight: 500 !important; }`;
		case "gentle": // Minor days: soft
		default:
			return `${S} h1::after { width: 3em !important; }`;
	}
}

/**
 * Standalone reading surface for theme-only days (no freeze): warm paper,
 * sefer typography, centered column. Scoped .yomtov-mode (any mode).
 */
export function yomtovSurfaceCss(opts = {}) {
	const S = `.${YOMTOV_CLASS}`;
	return `/* B"H — Yom Tov surface: a beautiful page for a holy day. */
${S} body {
	background: var(--yomtov-paper, #faf7ef) !important;
	color: var(--yomtov-ink, #33302a) !important;
	font-family: Georgia, "Times New Roman", "Noto Serif Hebrew", "Frank Ruhl Libre", serif !important;
	line-height: 1.85 !important;
	font-size: 1.12em !important;
}
${S} main, ${S} article, ${S} .content, ${S} .post-body {
	max-width: 42em !important;
	margin-left: auto !important;
	margin-right: auto !important;
	padding: 2.5rem 1.5rem !important;
	float: none !important;
}
${S} h1, ${S} h2, ${S} h3 { color: var(--yomtov-ink, #33302a) !important; line-height: 1.4 !important; }
${S} h1 { font-size: 1.9em !important; text-align: center; }
${S} [lang="he"], ${S} .hebrew { font-size: 1.22em !important; line-height: 1.95 !important; }
${S} a { color: var(--yomtov-accent, #7a6a3f) !important; }
${S} .only-yomtov { display: block !important; }
${S} .only-weekday { display: none !important; }
`;
}
