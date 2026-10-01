//B"H
//Boruch Hashem
//Blessed is He
"use strict";

const Respond = require("../core/respond.js");

/**
 * The Awtsmoos lets the outer vessel honor the inner gate's truthful state.
 * @description Return explicit transport envelopes so the router cannot replace 401 with 200.
 * @param {object} $i Live request context, retaining the OAuth challenge headers.
 * @param {object} data JSON-RPC body.
 * @param {number} status HTTP result.
 * @returns {object} Router-supported status, MIME type and response body.
 */
function json($i, data, status = 200) {
	Respond.setStatus($i, status);
	return {
		statusCode: status,
		mimeType: "application/json; charset=utf-8",
		response: JSON.stringify(data, null, 2)
	};
}

function empty(status = 202) {
	return { statusCode: status, response: "", mimeType: "application/json" };
}

module.exports = { json, empty };
