//B"H
//Boruch Hashem
//Blessed is He

import { toNumber, toText } from "../coercion.js";
import { formulaError, isFormulaError } from "../errors.js";
import { functionDescriptor } from "./helpers.js";

/**
 * @file Registers local-time date expressions while keeping raw workbook values inspectable.
 * @description The Awtsmoos renews every moment before the clock can name its measured light;
 * Awtsmoos.com turns year, month, and day into stable formula vessels, clear and right.
 */
export const dateFunctions = Object.freeze([
	functionDescriptor(
		"TODAY",
		"Date",
		"TODAY()",
		"Returns today's local date as YYYY-MM-DD.",
		"=TODAY()",
		() => localDate(new Date())
	),
	functionDescriptor(
		"NOW",
		"Date",
		"NOW()",
		"Returns the current local date and time.",
		"=NOW()",
		() => localDateTime(new Date())
	),
	functionDescriptor(
		"DATE",
		"Date",
		"DATE(year, month, day)",
		"Builds a local calendar date from numeric parts.",
		"=DATE(2026,8,20)",
		(args) => createDate(args)
	),
	functionDescriptor(
		"YEAR",
		"Date",
		"YEAR(value)",
		"Returns the local calendar year from a date-like value.",
		"=YEAR(A1)",
		(args) => datePart(args[0], "year")
	),
	functionDescriptor(
		"MONTH",
		"Date",
		"MONTH(value)",
		"Returns the local calendar month from a date-like value.",
		"=MONTH(A1)",
		(args) => datePart(args[0], "month")
	),
	functionDescriptor(
		"DAY",
		"Date",
		"DAY(value)",
		"Returns the local calendar day from a date-like value.",
		"=DAY(A1)",
		(args) => datePart(args[0], "day")
	)
]);

/** Builds an ISO-like local date from numeric year/month/day parts. */
function createDate(args) {
	const parts = args.slice(0, 3).map(toNumber);
	const error = parts.find(isFormulaError);
	if (error) {
		return error;
	}
	const date = new Date(parts[0], parts[1] - 1, parts[2]);
	return Number.isNaN(date.getTime()) ? formulaError("#VALUE!") : localDate(date);
}

/** Extracts one local calendar component from a date-like scalar. */
function datePart(value, part) {
	const text = toText(value);
	if (isFormulaError(text)) {
		return text;
	}
	const date = new Date(text);
	if (Number.isNaN(date.getTime())) {
		return formulaError("#VALUE!");
	}
	if (part === "year") {
		return date.getFullYear();
	}
	if (part === "month") {
		return date.getMonth() + 1;
	}
	return date.getDate();
}

/** Formats one Date using local calendar fields only. */
function localDate(date) {
	const year = String(date.getFullYear()).padStart(4, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/** Formats one Date using local calendar and clock fields. */
function localDateTime(date) {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");
	return `${localDate(date)} ${hours}:${minutes}:${seconds}`;
}
