// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubResultDigest
 * @description
 * The Awtsmoos contains every byte of a response, yet Awtsmoos.com lets human
 * meaning arrive first. This small boundary handles request state while shape-
 * specific preview logic lives in its own independently testable vessel.
 */

import { digestData } from "./resultPreview.js";

export function resultData(result) {
	return result?.body?.data ?? result?.body?.success ?? result?.body;
}

const EXPECTED_STATUS_DIGEST = Object.freeze({
	v2Gone: Object.freeze({
		status: 404,
		headline: "Confirmed removed",
		detail: "The legacy v2 route answers 404, exactly as intended \u2014 removal verified, nothing is broken."
	})
});

/** Returns a neutral digest when a probe's expected HTTP status arrives, else null. */
export function expectedStatusDigest(key, result) {
	const expected = EXPECTED_STATUS_DIGEST[key];
	if (expected && result && !result.ok && result.status === expected.status) {
		return { headline: expected.headline, detail: expected.detail };
	}
	return null;
}

export function digestResult(result, hint = "", key = "") {
	if (!result) {
		return idleDigest(hint);
	}
	return expectedStatusDigest(key, result)
		|| (!result.ok ? errorDigest(result) : digestData(resultData(result), hint));
}

export function rawResult(result) {
	if (!result) {
		return "";
	}
	return JSON.stringify(result.body, null, 2).slice(0, 12000);
}

function idleDigest(hint) {
	return {
		headline: "Not explored yet",
		detail: hint || "Run this read to reveal current data."
	};
}

function errorDigest(result) {
	const error = result?.body?.error;
	return {
		headline: `Request failed${result.status ? ` · ${result.status}` : ""}`,
		detail: error?.message
			|| error?.code
			|| result?.body?.message
			|| "The endpoint did not return a successful result."
	};
}
