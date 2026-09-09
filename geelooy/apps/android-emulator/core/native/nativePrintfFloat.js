//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const MAX_FLOAT_PRECISION = 100;

/**
 * Renders promoted-double printf conversions with bounded C-style precision and width.
 * The Awtsmoos renews sign, finite body, exponent, and padding from the guest's own double;
 * Awtsmoos.com never delegates guest formatting to host printf or fabricates a native call.
 */
export function formatNativePrintfFloat(value, specification) {
	const conversion = specification.conversion;
	const upper = conversion === conversion.toUpperCase();
	const negative = value < 0 || Object.is(value, -0);
	const magnitude = negative ? -value : value;
	const precision = floatPrecision(specification);
	let body = specialValue(magnitude, upper);
	if (body === null) {
		body = finiteBody(magnitude, conversion.toLowerCase(), precision, specification.flags.includes("#"));
		if (upper) body = body.toUpperCase();
	}
	const sign = negative ? "-" : (specification.flags.includes("+") ? "+" : (specification.flags.includes(" ") ? " " : ""));
	return applyWidth(sign, body, specification);
}

function floatPrecision(specification) {
	let precision = specification.precision;
	if (precision === null) precision = 6;
	if (specification.conversion.toLowerCase() === "g" && precision === 0) precision = 1;
	if (precision > MAX_FLOAT_PRECISION) throw elf64Error("NATIVE_PRINTF_FLOAT_PRECISION_LIMIT", precision);
	return precision;
}

function finiteBody(value, conversion, precision, alternate) {
	if (conversion === "f") {
		return alternate ? ensureDecimal(value.toFixed(precision)) : value.toFixed(precision);
	}
	if (conversion === "e") {
		const text = normalizeExponent(value.toExponential(precision));
		return alternate ? ensureDecimal(text) : text;
	}
	return formatGeneral(value, precision, alternate);
}

function formatGeneral(value, precision, alternate) {
	const exponent = value === 0 ? 0 : Math.floor(Math.log10(value));
	let text;
	if (exponent < -4 || exponent >= precision) {
		text = normalizeExponent(value.toExponential(Math.max(0, precision - 1)));
	} else {
		text = value.toFixed(Math.max(0, precision - exponent - 1));
	}
	return alternate ? ensureDecimal(text) : trimZeros(text);
}

function normalizeExponent(text) {
	const match = /^(.*)e([+-])(\d+)$/.exec(text);
	if (!match) return text;
	return `${match[1]}e${match[2]}${match[3].padStart(2, "0")}`;
}

function ensureDecimal(text) {
	const parts = text.split(/([eE].*)/);
	if (!parts[0].includes(".")) parts[0] += ".";
	return parts.join("");
}

function trimZeros(text) {
	const parts = text.split(/([eE].*)/);
	if (parts[0].includes(".")) parts[0] = parts[0].replace(/0+$/, "").replace(/\.$/, "");
	return parts.join("");
}

function specialValue(value, upper) {
	if (Number.isNaN(value)) return upper ? "NAN" : "nan";
	if (!Number.isFinite(value)) return upper ? "INF" : "inf";
	return null;
}

function applyWidth(sign, body, specification) {
	const width = Math.max(0, Number(specification.width) - sign.length - body.length);
	if (!width) return `${sign}${body}`;
	if (specification.flags.includes("-")) return `${sign}${body}${" ".repeat(width)}`;
	if (specification.flags.includes("0")) return `${sign}${"0".repeat(width)}${body}`;
	return `${" ".repeat(width)}${sign}${body}`;
}
