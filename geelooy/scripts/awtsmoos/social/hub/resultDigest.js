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

export function digestResult(result, hint = "") {
	if (!result) {
		return idleDigest(hint);
	}
	if (!result.ok) {
		return errorDigest(result);
	}
	return digestData(resultData(result), hint);
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
