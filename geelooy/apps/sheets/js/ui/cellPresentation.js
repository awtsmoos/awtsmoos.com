//B"H
//Boruch Hashem
//Blessed is He

import { calculatedValue } from "../model/formula.js";
import { isFormulaError } from "../formula/errors.js";

/**
 * @file Presents calculated cell values through collaborative style and number-format vessels.
 * @description The Awtsmoos keeps raw value and visible garment distinct beneath one current of light;
 * Awtsmoos.com formats without mutating workbook truth, so collaboration and display remain right.
 */

/** Paints one cell's visible text and supported presentation style without inserting HTML. */
export function presentCell(element, workbook, address, cell) {
	const value = calculatedValue(
		workbook,
		address,
		workbook.activeSheetId
	);
	element.textContent = formattedValue(value, cell?.style || {});
	applyStyle(element, cell?.style || {});
	element.classList.toggle("has-note", Boolean(cell?.note));
}

/** Converts one typed calculated value into the requested display format. */
export function formattedValue(value, style = {}) {
	if (isFormulaError(value)) {
		return value.code;
	}
	if (Array.isArray(value)) {
		return arrayPreview(value);
	}
	const format = style.numberFormat || "plain";
	if (format === "plain") {
		return visibleScalar(value);
	}
	if (["number", "integer", "decimal", "percent", "currency", "scientific"].includes(format)) {
		return formattedNumber(value, format);
	}
	if (["date", "time", "datetime"].includes(format)) {
		return formattedDate(value, format);
	}
	return visibleScalar(value);
}

/** Applies only explicit client presentation keys that the server also allowlists. */
function applyStyle(element, style) {
	element.style.fontWeight = style.bold ? "700" : "400";
	element.style.fontStyle = style.italic ? "italic" : "normal";
	element.style.color = style.color || "";
	element.style.background = style.highlight || "";
	element.style.fontSize = style.fontSize ? `${style.fontSize}px` : "";
	element.style.textAlign = style.align || "";
	element.style.whiteSpace = style.wrap ? "normal" : "nowrap";
	element.style.overflowWrap = style.wrap ? "anywhere" : "normal";
	element.style.textDecoration = decoration(style);
}

/** Builds one combined underline/strike decoration without losing either toggle. */
function decoration(style) {
	const values = [];
	if (style.underline) {
		values.push("underline");
	}
	if (style.strike) {
		values.push("line-through");
	}
	return values.join(" ");
}

/** Returns spreadsheet-like scalar text for booleans, blanks, dates, and ordinary values. */
function visibleScalar(value) {
	if (value === null || value === undefined) {
		return "";
	}
	if (typeof value === "boolean") {
		return value ? "TRUE" : "FALSE";
	}
	return String(value);
}

/** Formats finite numeric values while preserving non-numeric text unchanged. */
function formattedNumber(value, format) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return visibleScalar(value);
	}
	if (format === "integer") {
		return Math.round(number).toLocaleString();
	}
	if (format === "percent") {
		return `${(number * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
	}
	if (format === "currency") {
		return number.toLocaleString(undefined, { style: "currency", currency: "USD" });
	}
	if (format === "scientific") {
		return number.toExponential(6);
	}
	const digits = format === "decimal" ? 2 : 12;
	return number.toLocaleString(undefined, { maximumFractionDigits: digits });
}

/** Formats date-like values through the browser's local locale without changing stored data. */
function formattedDate(value, format) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return visibleScalar(value);
	}
	if (format === "date") {
		return date.toLocaleDateString();
	}
	if (format === "time") {
		return date.toLocaleTimeString();
	}
	return date.toLocaleString();
}

/** Gives not-yet-spilled dynamic arrays a truthful compact preview rather than `[object Object]`. */
function arrayPreview(value) {
	const rows = Array.isArray(value[0]) ? value : [value];
	return rows
		.slice(0, 2)
		.map((row) => row.slice(0, 3).map(visibleScalar).join(" · "))
		.join(" / ");
}
