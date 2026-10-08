//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Shabbos Mode stylesheets.
 * @description Generates the Shabbos stylesheet: all motion dies, interactive
 * chrome hides, hidden content expands, and the page becomes a warm, still,
 * sefer-like reading surface. Shabbos mode is not a degraded page — it is a
 * holier one. Includes a print stylesheet so Shabbos mode is print-ready
 * (people print for Shabbos).
 *
 * shabbosCss(opts)  -> screen stylesheet scoped under .shabbos-mode
 * printCss(opts)    -> @media print rules (usable standalone or with shabbos mode)
 */

import { HTML_CLASS } from "./SPEC.mjs";

/**
 * Build the Shabbos screen stylesheet.
 * @param {object} [opts]
 * @param {string[]} [opts.expandSelectors] Extra selectors forced visible.
 * @param {object} [opts.palette] {paper, ink, accent, muted}
 * @returns {string} CSS text.
 */
export function shabbosCss(opts = {}) {
	const S = `.${HTML_CLASS}`;
	const palette = Object.assign({
		paper: "#faf5ea",
		ink: "#3a2c1c",
		accent: "#8a6d3b",
		muted: "#7a6a52",
	}, opts.palette || {});
	const extra = Array.isArray(opts.expandSelectors) ? opts.expandSelectors : [];
	const expandRule = extra.length
		? `\n${S} ${extra.join(`,\n${S} `)} {\n\tdisplay: block !important;\n\tvisibility: visible !important;\n\tmax-height: none !important;\n\theight: auto !important;\n\topacity: 1 !important;\n}`
		: "";

	return `/* B"H — Shabbos Mode: stillness as design. No motion, no interaction, only rest. */
${S} {
	--shabbos-paper: ${palette.paper};
	--shabbos-ink: ${palette.ink};
	--shabbos-accent: ${palette.accent};
	--shabbos-muted: ${palette.muted};
	scroll-behavior: auto !important;
}

/* 1. All motion dies. */
${S} *,
${S} *::before,
${S} *::after {
	animation: none !important;
	-webkit-animation: none !important;
	transition: none !important;
	-webkit-transition: none !important;
	scroll-behavior: auto !important;
	caret-color: transparent !important;
}

/* 2. Warm sefer surface. */
${S} body {
	background: var(--shabbos-paper) !important;
	background-image: none !important;
	color: var(--shabbos-ink) !important;
	font-family: Georgia, "Times New Roman", "Noto Serif Hebrew", "Frank Ruhl Libre", serif !important;
	line-height: 1.9 !important;
	font-size: 1.15em !important;
	letter-spacing: 0.01em;
}

/* 3. Focused reading column — like an open sefer. */
${S} main,
${S} article,
${S} .content,
${S} .post-body,
${S} .teaching-body {
	max-width: 42em !important;
	margin-left: auto !important;
	margin-right: auto !important;
	padding: 3rem 1.5rem !important;
	float: none !important;
}

/* 4. Headings breathe. */
${S} h1, ${S} h2, ${S} h3, ${S} h4 {
	font-family: Georgia, "Times New Roman", "Noto Serif Hebrew", serif !important;
	color: var(--shabbos-ink) !important;
	font-weight: 600 !important;
	line-height: 1.4 !important;
	margin-top: 2.2em !important;
	margin-bottom: 0.8em !important;
	text-align: center;
}
${S} h1 { font-size: 2em !important; }
${S} h1::after {
	content: "";
	display: block;
	width: 4em;
	margin: 0.6em auto 0;
	border-bottom: 2px solid var(--shabbos-accent);
}

/* 5. Hebrew sings. */
${S} [lang="he"], ${S} .hebrew, ${S} .he-text {
	font-size: 1.25em !important;
	line-height: 2 !important;
	text-align: right;
	direction: rtl;
}

/* 6. Interactive chrome hides — nothing to click on Shabbos. */
${S} .no-shabbos,
${S} nav.site-nav,
${S} .site-header .menu,
${S} .sidebar,
${S} .comments-section,
${S} .comment-form,
${S} form,
${S} .search-box,
${S} .share-buttons,
${S} .social-buttons,
${S} .carousel,
${S} .slider,
${S} .tab-nav,
${S} .modal,
${S} .popup,
${S} .tooltip,
${S} .toast,
${S} .shabbos-toggle,
${S} video,
${S} audio {
	display: none !important;
}

/* 7. Everything hidden expands — accordions, tabs, collapsibles all open. */
${S} details > *,
${S} .accordion-panel,
${S} .collapsible-content,
${S} .tab-panel,
${S} .spoiler-content {
	display: block !important;
	visibility: visible !important;
	max-height: none !important;
	height: auto !important;
	opacity: 1 !important;
	overflow: visible !important;
}
${S} .accordion-toggle::after,
${S} .collapsible-toggle::after {
	content: none !important;
}

/* 8. Controls that remain become inert text. */
${S} button,
${S} .btn,
${S} input,
${S} select,
${S} textarea {
	pointer-events: none !important;
	user-select: text !important;
}

/* 9. Links rest — readable, no hover tricks. */
${S} a { color: var(--shabbos-accent) !important; text-decoration: underline; }
${S} a:hover, ${S} a:focus, ${S} a:active {
	color: var(--shabbos-accent) !important;
	text-decoration: underline !important;
	background: none !important;
	outline: none !important;
}

/* 10. Images sit quietly. */
${S} img {
	max-width: 100%;
	height: auto;
	border-radius: 2px;
	filter: sepia(0.18) !important;
}

/* 11. Footnotes come home — shown inline at the article's end. */
${S} .footnotes,
${S} .footnote-list,
${S} [data-footnotes] {
	display: block !important;
	margin-top: 3em !important;
	padding-top: 1.5em !important;
	border-top: 1px solid var(--shabbos-accent) !important;
	font-size: 0.92em !important;
	color: var(--shabbos-muted) !important;
}

/* 12. The Shabbos notice — a candle at the top of the page. */
${S} .shabbos-notice {
	display: block !important;
	text-align: center;
	padding: 1.1em 1em 1em;
	margin: 0 0 2em;
	border-top: 4px double var(--shabbos-accent);
	border-bottom: 1px solid var(--shabbos-accent);
	color: var(--shabbos-muted);
	font-style: italic;
	letter-spacing: 0.06em;
}
${S} .shabbos-notice .shabbos-candle { font-style: normal; }

/* 13. Reveal Shabbos-only content, hide weekday-only content. */
${S} .only-shabbos { display: block !important; }
${S} .only-weekday { display: none !important; }${expandRule}
`;
}

/**
 * Build the print stylesheet. Shabbos mode is print-ready: people print for Shabbos.
 * Scoped to .shabbos-mode by default; pass {unscoped:true} for a standalone sheet.
 * @param {object} [opts]
 * @param {boolean} [opts.unscoped] Emit without the .shabbos-mode scope.
 * @returns {string} CSS text.
 */
export function printCss(opts = {}) {
	const S = opts.unscoped ? "" : `.${HTML_CLASS} `;
	return `/* B"H — Shabbos print: a page prepared for rest. */
@page {
	margin: 2cm 1.8cm;
}
@media print {
	${S}.no-print,
	${S}.shabbos-notice,
	${S}nav,
	${S}.sidebar,
	${S}form,
	${S}button,
	${S}.btn,
	${S}.share-buttons,
	${S}.comments-section,
	${S}video,
	${S}audio {
		display: none !important;
	}
	${S}body {
		background: #ffffff !important;
		color: #111111 !important;
		font-size: 12pt !important;
		line-height: 1.8 !important;
	}
	${S}h1, ${S}h2, ${S}h3 {
		break-after: avoid;
		page-break-after: avoid;
	}
	${S}p, ${S}li, ${S}blockquote {
		orphans: 3;
		widows: 3;
	}
	${S}img {
		max-width: 100% !important;
		break-inside: avoid;
		page-break-inside: avoid;
	}
	${S}article, ${S}main {
		max-width: none !important;
		padding: 0 !important;
	}
	${S}a {
		color: #111111 !important;
		text-decoration: none !important;
	}
	${S}a[href^="http"]::after {
		content: " (" attr(href) ")";
		font-size: 0.8em;
		color: #555555;
	}
	${S}.footnotes {
		break-before: auto;
	}
}`;
}
