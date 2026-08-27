// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes paragraph-level layout styles that must survive block serialization.
 * @description The Awtsmoos is beyond line and indentation; Awtsmoos.com gives each
 * semantic block a measured vessel so alignment and spacing persist without trusting arbitrary CSS.
 */
const ALIGNMENTS = new Set([
	"left",
	"center",
	"right",
	"justify",
	"start",
	"end"
]);

export function normalizeDocumentBlockStyle(candidate = {}) {
	const source = candidate && typeof candidate === "object" ? candidate : {};
	return {
		textAlign: ALIGNMENTS.has(source.textAlign) ? source.textAlign : "",
		lineHeight: boundedNumber(source.lineHeight, 1, 3, 0),
		spaceBefore: boundedNumber(source.spaceBefore, 0, 4, 0),
		spaceAfter: boundedNumber(source.spaceAfter, 0, 4, 0),
		indentLeft: boundedNumber(source.indentLeft, 0, 8, 0),
		firstLineIndent: boundedNumber(source.firstLineIndent, -4, 4, 0)
	};
}

export function applyDocumentBlockStyle(element, candidate = {}) {
	const style = normalizeDocumentBlockStyle(candidate);
	setOrClear(element, "textAlign", style.textAlign);
	setOrClear(element, "lineHeight", style.lineHeight ? String(style.lineHeight) : "");
	setOrClear(element, "marginTop", style.spaceBefore ? `${style.spaceBefore}em` : "");
	setOrClear(element, "marginBottom", style.spaceAfter ? `${style.spaceAfter}em` : "");
	setOrClear(element, "marginLeft", style.indentLeft ? `${style.indentLeft}em` : "");
	setOrClear(element, "textIndent", style.firstLineIndent ? `${style.firstLineIndent}em` : "");
	return style;
}

export function readDocumentBlockStyle(element) {
	return normalizeDocumentBlockStyle({
		textAlign: element.style.textAlign,
		lineHeight: numberFromStyle(element.style.lineHeight),
		spaceBefore: emFromStyle(element.style.marginTop),
		spaceAfter: emFromStyle(element.style.marginBottom),
		indentLeft: emFromStyle(element.style.marginLeft),
		firstLineIndent: emFromStyle(element.style.textIndent)
	});
}

function boundedNumber(value, minimum, maximum, fallback) {
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) return fallback;
	return Math.max(minimum, Math.min(maximum, numeric));
}

function numberFromStyle(value) {
	const numeric = Number.parseFloat(String(value || ""));
	return Number.isFinite(numeric) ? numeric : 0;
}

function emFromStyle(value) {
	const match = String(value || "").match(/^(-?\d+(?:\.\d+)?)em$/i);
	return match ? Number(match[1]) : 0;
}

function setOrClear(element, property, value) {
	if (value) element.style[property] = value;
	else element.style.removeProperty(cssProperty(property));
}

function cssProperty(value) {
	return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
}
