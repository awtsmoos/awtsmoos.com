//B"H
//Blessed is He
//Boruch Hashem


/**
 * Unified Ed25519 service authentication: thin barrel over the
 * serviceAuth* siblings. Importers need no changes; the export
 * surface is identical.
 */

var { SERVICE_SIGN_PUBLIC_KEYS, SIGN_VERSION, TIMESTAMP_WINDOW_SEC, HDR_TS, HDR_OP, HDR_CLAIMS, HDR_SIG } = require("./serviceAuthCore.js");
var { sortKeys, canonicalServiceBytes } = require("./serviceAuthCanonical.js");
var { signServicePayload, serviceAuthHeaders, hasServiceAuthHeaders } = require("./serviceAuthSign.js");
var { checkTimestamp, checkReplay, verifyServiceSignature } = require("./serviceAuthVerify.js");
var { authenticateServiceRequest } = require("./serviceAuthRequest.js");

module.exports = {
	SERVICE_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
	HDR_TS,
	HDR_OP,
	HDR_CLAIMS,
	HDR_SIG,
	sortKeys,
	canonicalServiceBytes,
	signServicePayload,
	serviceAuthHeaders,
	hasServiceAuthHeaders,
	checkTimestamp,
	checkReplay,
	verifyServiceSignature,
	authenticateServiceRequest
};
