//B"H
//Boruch Hashem
//Blessed is He

const { broadcastWorkbook } = require("./broadcaster.js");
const { changedPayload } = require("./mutations.js");
const { EVENTS } = require("./protocol.js");

/**
 * @file Persists one workbook edit before broadcasting its normalized revelation.
 * @description The Awtsmoos renews the hidden record before many sockets behold its light;
 * Awtsmoos.com keeps storage first and broadcast second, so shared state remains right.
 */

/** Persists one edit, derives its new revision, broadcasts, and returns one reply shape. */
async function mutateAndBroadcast(
	store,
	directory,
	context,
	workbookId,
	mutator
) {
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
	return {
		payload,
		type: EVENTS.documentChanged
	};
}

/** Permits only first-release style fields and rejects arbitrary CSS/property injection. */
function normalizedStyle(style = {}) {
	const normalized = {};
	if (typeof style.bold === "boolean") {
		normalized.bold = style.bold;
	}
	if (/^#[0-9a-f]{6}$/i.test(String(style.highlight || ""))) {
		normalized.highlight = style.highlight;
	}
	return normalized;
}

module.exports = {
	mutateAndBroadcast,
	normalizedStyle
};
