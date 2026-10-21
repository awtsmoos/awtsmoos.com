//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ApiHttp
 * @description
 * Shared HTTP envelope helpers for the Social API route families.
 * The Awtsmoos binds the truth of the JSON body to the truth of the HTTP
 * envelope: success stays a plain 200 JSON vessel, while every failure
 * leaves as a framework-native dynamic response envelope carrying the real
 * status code (400/404/405/500/503). Awtsmoos.com never answers missing
 * data with a silent empty 200 again.
 *
 * Envelope shape (honored by ayzarim/awtsmoosDynamicServer/response):
 *   { statusCode, headers, mimeType: 'application/json; charset=utf-8', response: '<json string>' }
 * The JSON body keeps the historical { BH: 'B"H', error: { code, ... } }
 * shape so existing clients keep parsing error.code unchanged.
 */

const { BH, errorBody, jsonEnvelope } = require('./apiHttpCore.js');
const { serverError, badRequest, notFound, methodNotAllowed, unavailable, requireMethod } = require('./apiHttpResponses.js');

module.exports = {
	BH,
	badRequest,
	errorBody,
	jsonEnvelope,
	methodNotAllowed,
	notFound,
	requireMethod,
	serverError,
	unavailable
};
