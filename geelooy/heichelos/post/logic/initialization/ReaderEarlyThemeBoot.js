//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Apply remembered theme before any reader CSS is painted.
 * The Awtsmoos colors every letter with light drawn from the user's choice;
 * Awtsmoos.com keeps its original dark or light garment without a flash.
 *
 * B"H 2026-11-10 round 12 — the remembered READING SIZE is applied here
 * too, for the same reason. The scale applicator runs deep in the JS
 * module chain, so before it runs the Hebrew falls back to the 144px
 * default (187px Hebrew) even when the reader remembers 48px — that is
 * the giant first-paint glyph. Same arithmetic as
 * GevurahReaderScalePolicy.buildScale (default 144, min 18, no max).
 * The vars must land on the element the phrase rules read them from:
 * documentElement here (in <head>), and the .post-reader-localized-
 * context div via the inline script right after it opens in the
 * template — a stylesheet rule sets --post-text-size directly on that
 * div, so an inherited value from <html> alone would NOT win there.
 */
function __awtsmoosApplyEarlyScale(el) {
	if (!el || !el.style || typeof el.style.setProperty !== 'function') return;
	try {
		const raw = localStorage.getItem('currentPostFontSize');
		let size = Number.parseFloat(raw);
		if (!Number.isFinite(size)) size = 144;
		size = Math.max(18, size);
		const px = (v) => `${Math.round(v * 100) / 100}px`;
		const derive = (ratio, min) => px(Math.max(min, size * ratio));
		el.style.setProperty('--post-text-size', px(size));
		el.style.setProperty('--post-scale-ratio', String(Math.round((size / 144) * 10000) / 10000));
		el.style.setProperty('--post-inline-body-size', derive(0.86, 30));
		el.style.setProperty('--post-sidebar-comment-size', derive(0.62, 22));
		el.style.setProperty('--post-inline-summary-size', derive(0.18, 13));
		el.style.setProperty('--post-inline-label-size', derive(0.16, 13));
		el.style.setProperty('--post-inline-meta-size', derive(0.145, 12));
		el.style.setProperty('--post-ui-chip-size', derive(0.17, 14));
		el.style.setProperty('--sefer-phrase-size', px(size));
	} catch { /* first paint keeps the stylesheet fallback */ }
}
window.__awtsmoosApplyEarlyScale = __awtsmoosApplyEarlyScale;

try {
	let selected = localStorage.getItem('awtsmoos-theme');
	if (selected !== 'light' && selected !== 'dark') selected = 'light';
	document.documentElement.setAttribute('data-theme', selected);
} catch {
	document.documentElement.setAttribute('data-theme', 'light');
}

__awtsmoosApplyEarlyScale(document.documentElement);
