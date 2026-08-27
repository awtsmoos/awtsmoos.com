// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes the persistent physical and pageless layout of an Awtsmoos document.
 * @description The Awtsmoos is beyond measure, yet Awtsmoos.com gives paper a bounded
 * keli: width, height, margins, headers, footers, and page numbers descend from one covenant.
 */

const PAPER_SIZES = Object.freeze({
	letter: Object.freeze({ width: 8.5, height: 11 }),
	a4: Object.freeze({ width: 8.27, height: 11.69 }),
	legal: Object.freeze({ width: 8.5, height: 14 })
});

const MARGIN_PRESETS = Object.freeze({
	normal: Object.freeze({ top: 1, right: 1, bottom: 1, left: 1 }),
	narrow: Object.freeze({ top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }),
	wide: Object.freeze({ top: 1, right: 1.5, bottom: 1, left: 1.5 })
});

export const DEFAULT_DOCUMENT_LAYOUT = Object.freeze({
	mode: "page",
	paper: "letter",
	orientation: "portrait",
	marginPreset: "normal",
	margins: MARGIN_PRESETS.normal,
	header: Object.freeze({ enabled: false, text: "" }),
	footer: Object.freeze({ enabled: false, text: "" }),
	pageNumbers: false,
	pagelessWidth: "medium"
});

export function normalizeDocumentLayout(candidate = {}) {
	const paper = PAPER_SIZES[candidate.paper] ? candidate.paper : "letter";
	const marginPreset = MARGIN_PRESETS[candidate.marginPreset]
		? candidate.marginPreset
		: "normal";
	const baseMargins = MARGIN_PRESETS[marginPreset];
	return {
		mode: candidate.mode === "pageless" ? "pageless" : "page",
		paper,
		orientation: candidate.orientation === "landscape" ? "landscape" : "portrait",
		marginPreset,
		margins: normalizeMargins(candidate.margins, baseMargins),
		header: normalizeBand(candidate.header),
		footer: normalizeBand(candidate.footer),
		pageNumbers: candidate.pageNumbers === true,
		pagelessWidth: ["narrow", "medium", "wide", "full"].includes(candidate.pagelessWidth)
			? candidate.pagelessWidth
			: "medium"
	};
}

export function physicalPageSize(layout = {}) {
	const normalized = normalizeDocumentLayout(layout);
	const paper = PAPER_SIZES[normalized.paper];
	return normalized.orientation === "landscape"
		? { width: paper.height, height: paper.width }
		: { ...paper };
}

export function marginsForPreset(preset = "normal") {
	const margins = MARGIN_PRESETS[preset] || MARGIN_PRESETS.normal;
	return { ...margins };
}

function normalizeMargins(value, fallback) {
	const source = value && typeof value === "object" ? value : fallback;
	return {
		top: boundedInches(source.top, fallback.top),
		right: boundedInches(source.right, fallback.right),
		bottom: boundedInches(source.bottom, fallback.bottom),
		left: boundedInches(source.left, fallback.left)
	};
}

function normalizeBand(value) {
	const source = value && typeof value === "object" ? value : {};
	return {
		enabled: source.enabled === true,
		text: String(source.text || "").slice(0, 300)
	};
}

function boundedInches(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric)
		? Math.max(0.25, Math.min(3, numeric))
		: fallback;
}
