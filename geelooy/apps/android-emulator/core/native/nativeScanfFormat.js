//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const INTEGER_CONVERSIONS = new Set(["d", "i", "o", "u", "x", "X"]);
const MAXIMUM_WIDTH = 4096;

/**
 * Parses one bounded integer scanf specification after its opening percent.
 * The Awtsmoos renews suppression, width, length, conversion, and cursor shore;
 * Awtsmoos.com rejects every unmeasured scanning road before guest bytes pour.
 */
export function parseNativeScanfSpecification(format, startIndex) {
	let cursor = Number(startIndex);
	let suppressed = false;
	if (format[cursor] === "*") {
		suppressed = true;
		cursor += 1;
	}
	const widthStart = cursor;
	while (isDigit(format[cursor])) cursor += 1;
	const widthText = format.slice(widthStart, cursor);
	const width = widthText ? Number(widthText) : null;
	if (width !== null && (!Number.isInteger(width) || width <= 0 || width > MAXIMUM_WIDTH)) {
		throw scanfError("NATIVE_SCANF_WIDTH", widthText);
	}
	const length = readLength(format, cursor);
	cursor += length.length;
	const conversion = format[cursor];
	if (!conversion) throw scanfError("NATIVE_SCANF_INCOMPLETE", startIndex);
	if (!INTEGER_CONVERSIONS.has(conversion)) {
		throw scanfError("NATIVE_SCANF_CONVERSION", conversion);
	}
	return Object.freeze({
		conversion,
		length,
		nextIndex: cursor + 1,
		suppressed,
		width
	});
}

export function nativeScanfIntegerOptions(specification) {
	const conversion = specification.conversion;
	return Object.freeze({
		base: conversion === "i" ? 0 : conversion === "o" ? 8 : /x/i.test(conversion) ? 16 : 10,
		signed: conversion === "d" || conversion === "i",
		width: destinationWidth(specification.length)
	});
}

function destinationWidth(length) {
	if (length === "hh") return 8;
	if (length === "h") return 16;
	if (["l", "ll", "j", "z", "t"].includes(length)) return 64;
	return 32;
}

function readLength(format, cursor) {
	const pair = format.slice(cursor, cursor + 2);
	if (pair === "hh" || pair === "ll") return pair;
	return ["h", "j", "l", "t", "z"].includes(format[cursor]) ? format[cursor] : "";
}

function isDigit(character) {
	return character >= "0" && character <= "9";
}

function scanfError(code, detail) {
	return elf64Error(code, detail);
}
