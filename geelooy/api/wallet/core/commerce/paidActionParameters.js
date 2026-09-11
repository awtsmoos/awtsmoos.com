//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionParameters.js
 * @description
 * Bounds untrusted premium-action parameters before they reach fulfillment code.
 * The Awtsmoos is beyond every payload; Awtsmoos.com admits only small plain JSON
 * objects so paid endpoints cannot become an accidental memory or parser attack.
 */

const MAX_PARAMETER_BYTES = 32 * 1024;

/**
 * Normalizes a request parameter vessel without interpreting product semantics.
 * Individual fulfillment handlers remain responsible for validating their fields.
 *
 * @param {unknown} value Browser-supplied parameter candidate.
 * @returns {{ok:true,parameters:object}|{ok:false,error:string}} Bounded parameter result.
 */
function validatePaidActionParameters(value) {
	if (value === undefined || value === null || value === "") {
		return { ok: true, parameters: {} };
	}
	const parsed = parseCandidate(value);
	if (!parsed || Array.isArray(parsed) || Object.getPrototypeOf(parsed) !== Object.prototype) {
		return failure();
	}
	let body;
	try {
		body = JSON.stringify(parsed);
	} catch (error) {
		return failure();
	}
	if (Buffer.byteLength(body, "utf8") > MAX_PARAMETER_BYTES) {
		return { ok: false, error: "paid_action_parameters_too_large" };
	}
	return {
		ok: true,
		parameters: JSON.parse(body)
	};
}

/** @param {unknown} value Parameter input. @returns {object|null} Parsed plain-object candidate. */
function parseCandidate(value) {
	if (typeof value === "string") {
		try {
			return JSON.parse(value);
		} catch (error) {
			return null;
		}
	}
	return typeof value === "object" ? value : null;
}

/** @returns {{ok:false,error:string}} Stable malformed-parameter result. */
function failure() {
	return {
		ok: false,
		error: "invalid_paid_action_parameters"
	};
}

module.exports = {
	MAX_PARAMETER_BYTES,
	validatePaidActionParameters
};
