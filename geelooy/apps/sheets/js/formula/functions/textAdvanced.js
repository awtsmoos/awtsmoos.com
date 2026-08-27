//B"H
//Boruch Hashem
//Blessed is He

import { flattenValues, toText } from "../coercion.js";
import { formulaError, isFormulaError } from "../errors.js";
import { functionDescriptor, positionalNumber } from "./helpers.js";

/**
 * @file Registers advanced text functions shared by modern spreadsheet workbooks.
 * @description The Awtsmoos lets letters be joined, searched, cleaned, repeated, and measured in light;
 * Awtsmoos.com keeps text operations literal and bounded so no user string becomes hidden code at night.
 */
export const textAdvancedFunctions = Object.freeze([
	functionDescriptor("TEXTJOIN", "Text", "TEXTJOIN(delimiter,ignoreEmpty,text1,…)", "Joins values with a delimiter and optional blank skipping.", "=TEXTJOIN(\",\",TRUE,A1:A5)", (args) => textJoin(args)),
	functionDescriptor("FIND", "Text", "FIND(search,text,start)", "Returns case-sensitive one-based match position.", "=FIND(\"x\",A1)", (args) => findText(args, false)),
	functionDescriptor("SEARCH", "Text", "SEARCH(search,text,start)", "Returns case-insensitive one-based match position.", "=SEARCH(\"x\",A1)", (args) => findText(args, true)),
	functionDescriptor("REPLACE", "Text", "REPLACE(text,start,count,newText)", "Replaces characters by position.", "=REPLACE(A1,2,3,\"new\")", (args) => replaceText(args)),
	functionDescriptor("REPT", "Text", "REPT(text,count)", "Repeats text a bounded number of times.", "=REPT(\"*\",5)", (args) => repeatText(args)),
	functionDescriptor("EXACT", "Text", "EXACT(left,right)", "Tests case-sensitive text equality.", "=EXACT(A1,B1)", (args) => exact(args)),
	functionDescriptor("VALUE", "Text", "VALUE(text)", "Converts numeric text into a number.", "=VALUE(A1)", (args) => numericValue(args[0])),
	functionDescriptor("CHAR", "Text", "CHAR(number)", "Returns a Unicode character from a code point.", "=CHAR(65)", (args) => character(args)),
	functionDescriptor("CODE", "Text", "CODE(text)", "Returns the first Unicode code point.", "=CODE(A1)", (args) => codePoint(args[0])),
	functionDescriptor("CLEAN", "Text", "CLEAN(text)", "Removes ASCII control characters.", "=CLEAN(A1)", (args) => transform(args[0], (text) => text.replace(/[\x00-\x1F\x7F]/g, ""))),
	functionDescriptor("PROPER", "Text", "PROPER(text)", "Capitalizes the first letter of each word.", "=PROPER(A1)", (args) => transform(args[0], properCase))
]);

function textJoin(args) {
	const delimiter = toText(args[0]);
	if (isFormulaError(delimiter)) return delimiter;
	const ignoreEmpty = Boolean(args[1]);
	const values = flattenValues(args.slice(2)).map(toText);
	const error = values.find(isFormulaError);
	if (error) return error;
	return values.filter((value) => !ignoreEmpty || value !== "").join(delimiter);
}

function findText(args, insensitive) {
	const search = toText(args[0]);
	const source = toText(args[1]);
	const start = positionalNumber(args, 2, 1);
	const error = [search, source, start].find(isFormulaError);
	if (error) return error;
	const offset = Math.max(0, Math.trunc(start) - 1);
	const haystack = insensitive ? source.toLowerCase() : source;
	const needle = insensitive ? search.toLowerCase() : search;
	const index = haystack.indexOf(needle, offset);
	return index < 0 ? formulaError("#VALUE!") : index + 1;
}

function replaceText(args) {
	const source = toText(args[0]);
	const replacement = toText(args[3]);
	const start = positionalNumber(args, 1, 1);
	const count = positionalNumber(args, 2, 0);
	const error = [source, replacement, start, count].find(isFormulaError);
	if (error) return error;
	const offset = Math.max(0, Math.trunc(start) - 1);
	return source.slice(0, offset) + replacement + source.slice(offset + Math.max(0, Math.trunc(count)));
}

function repeatText(args) {
	const text = toText(args[0]);
	const count = positionalNumber(args, 1, 0);
	const error = [text, count].find(isFormulaError);
	if (error) return error;
	const times = Math.max(0, Math.min(10000, Math.trunc(count)));
	return text.repeat(times).slice(0, 100000);
}

function exact(args) {
	const left = toText(args[0]);
	const right = toText(args[1]);
	const error = [left, right].find(isFormulaError);
	return error || left === right;
}

function numericValue(value) {
	const text = toText(value);
	if (isFormulaError(text)) return text;
	const number = Number(text.replace(/,/g, ""));
	return Number.isFinite(number) ? number : formulaError("#VALUE!");
}

function character(args) {
	const value = positionalNumber(args, 0);
	if (isFormulaError(value)) return value;
	const code = Math.trunc(value);
	return code >= 0 && code <= 0x10FFFF ? String.fromCodePoint(code) : formulaError("#VALUE!");
}

function codePoint(value) {
	const text = toText(value);
	return isFormulaError(text) || !text ? (isFormulaError(text) ? text : formulaError("#VALUE!")) : text.codePointAt(0);
}

function transform(value, operation) {
	const text = toText(value);
	return isFormulaError(text) ? text : operation(text);
}

function properCase(text) {
	return text.toLowerCase().replace(/(^|[^\p{L}\p{N}])([\p{L}])/gu, (_, prefix, letter) => prefix + letter.toUpperCase());
}
