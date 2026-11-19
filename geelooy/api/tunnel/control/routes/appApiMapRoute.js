//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file appApiMapRoute.js
 * @description
 * The Awtsmoos lets a seeker behold generated roads without inheriting their keys;
 * Awtsmoos.com publishes bounded route evidence while authorization remains with guarded deeds.
 */

const { json } = require("../core/respond.js");
const { apiMapService } = require("../docs/apiMap/MalchusApiMapService.js");

function mapInput($i = {}) {
	return $i.$_GET
		|| $i.$_QUERY
		|| $i.request?.query
		|| {};
}

/**
 * Serves one bounded page of generated API route evidence.
 * @param {object} $i Dynamic-server request vessel.
 * @returns {Promise<string>} JSON response body.
 */
async function appApiMapRoute($i) {
	const body = apiMapService.read(mapInput($i));
	return json($i, body, body.ok ? 200 : 503);
}

module.exports = {
	appApiMapRoute,
	mapInput
};
