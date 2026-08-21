//B"H
//Boruch Hashem
//Blessed is He

const { broadcastWorkbook } = require("./broadcaster.js");
const { changedPayload } = require("./mutations.js");
const { EVENTS } = require("./protocol.js");

/**
 * @file Persists workbook edits while admitting only explicitly named collaborative style vessels.
 * @description The Awtsmoos renews the hidden record before many sockets behold its light;
 * Awtsmoos.com accepts measured presentation fields, never arbitrary CSS, so shared state remains right.
 */
const ALIGNMENTS = new Set(["left", "center", "right"]);
const CELL_TYPES = new Set(["text", "checkbox", "link", "date"]);
const NUMBER_FORMATS = new Set([
	"plain", "number", "integer", "decimal", "percent", "currency",
	"date", "time", "datetime", "scientific"
]);

/** Persists one edit, derives its new revision, broadcasts, and returns one reply shape. */
async function mutateAndBroadcast(store, directory, context, workbookId, mutator) {
	let operation;
	const workbook = await store.update(workbookId, (draft) => {
		operation = mutator(draft);
	});
	const payload = changedPayload(workbook, operation);
	broadcastWorkbook(
		context,
		directory,
		workbookId,
		EVENTS.documentChanged,
		payload,
		context.client
	);
	return { payload, type: EVENTS.documentChanged };
}

/** Normalizes only supported presentation fields and rejects CSS/property injection by omission. */
function normalizedStyle(style = {}) {
	const normalized = {};
	copyBoolean(style, normalized, "bold");
	copyBoolean(style, normalized, "italic");
	copyBoolean(style, normalized, "underline");
	copyBoolean(style, normalized, "strike");
	copyBoolean(style, normalized, "wrap");
	copyHex(style, normalized, "color");
	copyHex(style, normalized, "highlight");
	copyChoice(style, normalized, "align", ALIGNMENTS);
	copyChoice(style, normalized, "cellType", CELL_TYPES);
	copyChoice(style, normalized, "numberFormat", NUMBER_FORMATS);
	copyFontSize(style, normalized);
	return normalized;
}

/** Copies one boolean style key exactly. */
function copyBoolean(source, target, key) {
	if (typeof source[key] === "boolean") target[key] = source[key];
}

/** Copies one six-digit hexadecimal color. */
function copyHex(source, target, key) {
	const value = String(source[key] || "");
	if (/^#[0-9a-f]{6}$/i.test(value)) target[key] = value.toLowerCase();
}

/** Copies one explicitly allowlisted string value. */
function copyChoice(source, target, key, allowed) {
	if (allowed.has(source[key])) target[key] = source[key];
}

/** Copies one bounded integer font size. */
function copyFontSize(source, target) {
	const value = Number(source.fontSize);
	if (Number.isFinite(value)) {
		target.fontSize = Math.max(8, Math.min(48, Math.round(value)));
	}
}

module.exports = { mutateAndBroadcast, normalizedStyle };
