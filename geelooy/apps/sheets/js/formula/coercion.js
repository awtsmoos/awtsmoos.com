//B"H
//Boruch Hashem
//Blessed is He

import { formulaError, isFormulaError } from "./errors.js";

/**
 * @file Centralizes spreadsheet value coercion for operators and registered functions.
 * @description The Awtsmoos gives number, text, blank, and truth a measured gate of light;
 * Awtsmoos.com keeps every formula family under one conversion law so results stay right.
 */

/** Flattens nested range arguments without mutating the original value tree. */
export function flattenValues(values) {
	const flattened = [];
	for (const value of values || []) {
		if (Array.isArray(value)) {
			flattened.push(...flattenValues(value));
		} else {
			flattened.push(value);
		}
	}
	return flattened;
}

/** Converts one scalar into a number or an explicit spreadsheet error. */
export function toNumber(value) {
	if (isFormulaError(value)) {
		return value;
	}
	if (value === "" || value === null || value === undefined) {
		return 0;
	}
	if (typeof value === "boolean") {
		return value ? 1 : 0;
	}
	const number = Number(value);
	return Number.isFinite(number) ? number : formulaError("#VALUE!");
}

/** Converts one scalar into spreadsheet truthiness. */
export function toBoolean(value) {
	if (isFormulaError(value)) {
		return value;
	}
	if (typeof value === "boolean") {
		return value;
	}
	if (typeof value === "number") {
		return value !== 0;
	}
	if (value === "" || value === null || value === undefined) {
		return false;
	}
	const text = String(value).trim().toUpperCase();
	if (text === "TRUE") {
		return true;
	}
	if (text === "FALSE") {
		return false;
	}
	return true;
}

/** Converts one scalar into visible text while preserving formula errors. */
export function toText(value) {
	if (isFormulaError(value)) {
		return value;
	}
	if (value === null || value === undefined) {
		return "";
	}
	return String(value);
}

/** Returns whether a spreadsheet scalar is semantically blank. */
export function isBlank(value) {
	return value === "" || value === null || value === undefined;
}
