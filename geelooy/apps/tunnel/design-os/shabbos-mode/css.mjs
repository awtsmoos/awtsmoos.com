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
		? `\n${S}${S} ${extra.join(`,\n${S} `)} {\n\tdisplay: block;\n\tvisibility: visible;\n\tmax-height: none;\n\theight: auto;\n\topacity: 1;\n}`
		: "";

	return `/* B"H — Shabbos Mode: stillness as design. No motion, no interaction, only rest. */
${S}${S} {
	--shabbos-paper: ${palette.paper};
	--shabbos-ink: ${palette.ink};
	--shabbos-accent: ${palette.accent};
	--shabbos-muted: ${palette.muted};
	scroll-behavior: auto;
}

/* 1. All motion dies. */
${S}${S} *,
${S}${S} *::before,
${S}${S} *::after {
	animation: none;
	-webkit-animation: none;
	transition: none;
	-webkit-transition: none;
	scroll-behavior: auto;
	caret-color: transparent;
}

/* 2. Warm sefer surface. */
${S}${S} body {
	background: var(--shabbos-paper);
	background-image: none;
	color: var(--shabbos-ink);
	font-family: Georgia, "Times New Roman", "Noto Serif Hebrew", "Frank Ruhl Libre", serif;
	line-height: 1.9;
	font-size: 1.15em;
	letter-spacing: 0.01em;
}

/* 3. Focused reading column — like an open sefer. */
${S}${S} main,
${S}${S} article,
${S}${S} .content.content,
${S}${S} .post-body.post-body,
${S}${S} .teaching-body.teaching-body {
	max-width: 42em;
	margin-left: auto;
	margin-right: auto;
	padding: 3rem 1.5rem;
	float: none;
}

/* 4. Headings breathe. */
${S}${S} h1, ${S}${S} h2, ${S}${S} h3, ${S}${S} h4 {
	font-family: Georgia, "Times New Roman", "Noto Serif Hebrew", serif;
	color: var(--shabbos-ink);
	font-weight: 600;
	line-height: 1.4;
	margin-top: 2.2em;
	margin-bottom: 0.8em;
	text-align: center;
}
${S}${S} h1 { font-size: 2em; }
${S} h1::after {
	content: "";
	display: block;
	width: 4em;
	margin: 0.6em auto 0;
	border-bottom: 2px solid var(--shabbos-accent);
}

/* 5. Hebrew sings. */
${S}${S} [lang="he"][lang="he"], ${S}${S} .hebrew.hebrew, ${S}${S} .he-text.he-text {
	font-size: 1.25em;
	line-height: 2;
	text-align: right;
	direction: rtl;
}

/* 6. Interactive chrome hides — nothing to click on Shabbos. */
${S}${S} .no-shabbos.no-shabbos,
${S}${S} nav.site-nav.site-nav,
${S}${S} .site-header.site-header .menu.menu,
${S}${S} .sidebar.sidebar,
${S}${S} .comments-section.comments-section,
${S}${S} .comment-form.comment-form,
${S}${S} form,
${S}${S} .search-box.search-box,
${S}${S} .share-buttons.share-buttons,
${S}${S} .social-buttons.social-buttons,
${S}${S} .carousel.carousel,
${S}${S} .slider.slider,
${S}${S} .tab-nav.tab-nav,
${S}${S} .modal.modal,
${S}${S} .popup.popup,
${S}${S} .tooltip.tooltip,
${S}${S} .toast.toast,
${S}${S} .shabbos-toggle.shabbos-toggle,
${S}${S} video,
${S}${S} audio {
	display: none;
}

/* 7. Everything hidden expands — accordions, tabs, collapsibles all open. */
${S}${S} details > *,
${S}${S} .accordion-panel.accordion-panel,
${S}${S} .collapsible-content.collapsible-content,
${S}${S} .tab-panel.tab-panel,
${S}${S} .spoiler-content.spoiler-content {
	display: block;
	visibility: visible;
	max-height: none;
	height: auto;
	opacity: 1;
	overflow: visible;
}
${S}${S} .accordion-toggle.accordion-toggle::after,
${S}${S} .collapsible-toggle.collapsible-toggle::after {
	content: none;
}

/* 8. Controls that remain become inert text. */
${S}${S} button,
${S}${S} .btn.btn,
${S}${S} input,
${S}${S} select,
${S}${S} textarea {
	pointer-events: none;
	user-select: text;
}

/* 9. Links rest — readable, no hover tricks. */
${S}${S} a { color: var(--shabbos-accent); text-decoration: underline; }
${S}${S} a:hover, ${S}${S} a:focus, ${S}${S} a:active {
	color: var(--shabbos-accent);
	text-decoration: underline;
	background: none;
	outline: none;
}

/* 10. Images sit quietly. */
${S}${S} img {
	max-width: 100%;
	height: auto;
	border-radius: 2px;
	filter: sepia(0.18);
}

/* 11. Footnotes come home — shown inline at the article's end. */
${S}${S} .footnotes.footnotes,
${S}${S} .footnote-list.footnote-list,
${S}${S} [data-footnotes][data-footnotes] {
	display: block;
	margin-top: 3em;
	padding-top: 1.5em;
	border-top: 1px solid var(--shabbos-accent);
	font-size: 0.92em;
	color: var(--shabbos-muted);
}

/* 12. The Shabbos notice — a candle at the top of the page. */
${S}${S} .shabbos-notice.shabbos-notice {
	display: block;
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
${S}${S} .only-shabbos.only-shabbos { display: block; }
${S}${S} .only-weekday.only-weekday { display: none; }${expandRule}
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
	${S}.no-print.no-print,
	${S}.shabbos-notice.shabbos-notice,
	${S}${S}nav,
	${S}.sidebar.sidebar,
	${S}${S}form,
	${S}${S}button,
	${S}.btn.btn,
	${S}.share-buttons.share-buttons,
	${S}.comments-section.comments-section,
	${S}${S}video,
	${S}${S}audio {
		display: none;
	}
	${S}${S}body {
		background: #ffffff;
		color: #111111;
		font-size: 12pt;
		line-height: 1.8;
	}
	${S}h1, ${S}h2, ${S}h3 {
		break-after: avoid;
		page-break-after: avoid;
	}
	${S}p, ${S}li, ${S}blockquote {
		orphans: 3;
		widows: 3;
	}
	${S}${S}img {
		max-width: 100%;
		break-inside: avoid;
		page-break-inside: avoid;
	}
	${S}${S}article, ${S}${S}main {
		max-width: none;
		padding: 0;
	}
	${S}${S}a {
		color: #111111;
		text-decoration: none;
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
