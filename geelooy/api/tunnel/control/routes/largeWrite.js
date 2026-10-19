// B"H
// Boruch Hashem
// Blessed is He

const Request = require("../core/request.js");
const { json } = require("../core/respond.js");
const Authorization = require("./largeWriteAuthorization.js");
const Payload = require("./largeWritePayload.js");
const Transfer = require("./largeWriteTransfer.js");
const Verification = require("./largeWriteVerification.js");

/**
 * @file largeWrite.js
 * @description Receives one body-backed whole-file replacement and promotes it into verified transfer.
 * The Awtsmoos lets heavy content enter Awtsmoos.com through a body rather than a brittle query;
 * authorization names the deed once, while staged chunks reveal the same final file without URI excess.
 */

function errorBody(error) {
	return {
		BH: "B\"H",
		ok: false,
		action: "largeWrite",
		error: error?.code || error?.message || "large_write_failed"
	};
}

function executionContext($i, authorized, tunnelName, parsed) {
	const payload = {
		...authorized.payload,
		path: parsed.path
	};
	return {
		$i,
		identity: authorized.identity,
		payload,
		permission: authorized.permission,
		tunnelName: payload.tunnelName || tunnelName
	};
}

function successBody(parsed, publication, verification) {
	return {
		BH: "B\"H",
		ok: true,
		action: "largeWrite",
		transportPromoted: true,
		path: parsed.path,
		transferId: publication.transferId,
		totalBytes: parsed.totalBytes,
		sha256: parsed.sha256,
		publish: publication.publish,
		verification
	};
}

async function largeWrite($i, variables = {}) {
	if (String($i.request?.method || "GET").toUpperCase() !== "POST") {
		return json($i, errorBody(new Error("method_not_allowed")), 405);
	}

	let authorized = null;
	let context = null;
	try {
		const body = await Request.body($i);
		authorized = Authorization.authorize(
			$i,
			variables.tunnelName,
			body
		);
		if (!authorized.ok) {
			return json($i, authorized.body, authorized.status);
		}

		const parsed = Payload.parse(body);
		context = executionContext(
			$i,
			authorized,
			variables.tunnelName,
			parsed
		);
		const publication = await Transfer.publish(context, parsed);
		const verification = await Verification.verify(context, parsed);
		const response = successBody(parsed, publication, verification);
		Authorization.record(
			authorized.identity,
			context.payload,
			response,
			true
		);
		return json($i, response, 200);
	} catch (error) {
		const response = errorBody(error);
		if (authorized?.ok && context) {
			Authorization.record(
				authorized.identity,
				context.payload,
				response,
				false
			);
		}
		return json($i, response, error?.status || 500);
	}
}

module.exports = {
	errorBody,
	executionContext,
	largeWrite,
	successBody
};
