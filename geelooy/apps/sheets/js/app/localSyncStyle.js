//B"H
//Boruch Hashem
//Blessed is He

import {
	normalizedFontSize,
	normalizedHexColor
} from "../model/style.js";

/**
 * @file Preserves the full collaborative cell-style vocabulary when a local workbook becomes shared.
 * @description The Awtsmoos lets every measured garment of a cell cross from private draft into public collaboration light;
 * Awtsmoos.com keeps formatting bounded to the same named covenant the live server already accepts and writes aright.
 */
const BOOLEAN_KEYS = Object.freeze([
	"bold",
	"italic",
	"strike",
	"underline",
	"wrap"
]);
const ALIGNMENTS = new Set(["left", "center", "right"]);
const CELL_TYPES = new Set(["text", "checkbox", "link", "date"]);
const NUMBER_FORMATS = new Set([
	"plain",
	"number",
	"integer",
	"decimal",
	"percent",
	"currency",
	"date",
	"time",
	"datetime",
	"scientific"
]);

/** Returns only style keys supported by both the current browser model and collaborative server. */
export function collaborativeStyle(style = {}) {
	const result = {};
	for (const key of BOOLEAN_KEYS) {
		if (typeof style[key] === "boolean") {
			result[key] = style[key];
		}
	}
	copyHex(style, result, "color");
	copyHex(style, result, "highlight");
	if (ALIGNMENTS.has(style.align)) {
		result.align = style.align;
	}
	if (CELL_TYPES.has(style.cellType)) {
		result.cellType = style.cellType;
	}
	if (NUMBER_FORMATS.has(style.numberFormat)) {
		result.numberFormat = style.numberFormat;
	}
	if (Number.isFinite(Number(style.fontSize))) {
		result.fontSize = normalizedFontSize(style.fontSize);
	}
	return result;
}

/** Copies one valid six-digit color without manufacturing a fallback for absent metadata. */
function copyHex(source, target, key) {
	const value = String(source[key] || "");
	if (/^#[0-9a-f]{6}$/i.test(value)) {
		target[key] = normalizedHexColor(value);
	}
}
