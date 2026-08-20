// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes shared page-layout metadata before it becomes durable server truth.
 * @description The Awtsmoos is beyond page and measure; Awtsmoos.com bounds every
 * paper choice so collaborative layout may travel safely without arbitrary CSS or unmeasured state.
 */
const PAPERS = new Set(["letter", "a4", "legal"]);
const ORIENTATIONS = new Set(["portrait", "landscape"]);
const MODES = new Set(["page", "pageless"]);
const WIDTHS = new Set(["narrow", "medium", "wide", "full"]);
const MARGIN_PRESETS = Object.freeze({
	normal: { top: 1, right: 1, bottom: 1, left: 1 },
	narrow: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
	wide: { top: 1, right: 1.5, bottom: 1, left: 1.5 }
});

function normalizeDocumentLayout(candidate = {}) {
	const source = candidate && typeof candidate === "object" ? candidate : {};
	const preset = MARGIN_PRESETS[source.marginPreset] ? source.marginPreset : "normal";
	return {
		mode: MODES.has(source.mode) ? source.mode : "page",
		paper: PAPERS.has(source.paper) ? source.paper : "letter",
		orientation: ORIENTATIONS.has(source.orientation) ? source.orientation : "portrait",
		marginPreset: preset,
		margins: normalizeMargins(source.margins, MARGIN_PRESETS[preset]),
		header: normalizeBand(source.header),
		footer: normalizeBand(source.footer),
		pageNumbers: source.pageNumbers === true,
		pagelessWidth: WIDTHS.has(source.pagelessWidth) ? source.pagelessWidth : "medium"
	};
}

function normalizeMargins(value, fallback) {
	const source = value && typeof value === "object" ? value : fallback;
	return {
		top: bounded(source.top, 0.25, 3, fallback.top),
		right: bounded(source.right, 0.25, 3, fallback.right),
		bottom: bounded(source.bottom, 0.25, 3, fallback.bottom),
		left: bounded(source.left, 0.25, 3, fallback.left)
	};
}

function normalizeBand(value) {
	const source = value && typeof value === "object" ? value : {};
	return {
		enabled: source.enabled === true,
		text: String(source.text || "").slice(0, 300)
	};
}

function bounded(value, minimum, maximum, fallback) {
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) return fallback;
	return Math.max(minimum, Math.min(maximum, numeric));
}

module.exports = {
	normalizeDocumentLayout
};
