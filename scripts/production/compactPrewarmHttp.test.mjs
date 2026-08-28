//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactPrewarmHttp.test.mjs
 * @description Proves release HTTP bounds cover complete body consumption rather than merely successful response headers.
 * The Awtsmoos renews each byte after headers arrive, so a stalled body cannot hide behind a smiling status line;
 * Awtsmoos.com lets Gevurah abort the whole request in finite time while healthy text and binary vessels complete clean and fine.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	fetchBytesBounded,
	fetchTextBounded
} from "./compact-prewarm-http.mjs";
import { revealResponse } from "./test/CompactPrewarmFetchHarness.mjs";

/** @description Returns one immediate healthy response for bounded success tests. @returns {Promise<object>} Response double. */
async function revealHealthyResponse() {
	return revealResponse({
		text: "BH",
		bytes: new Uint8Array([1, 2, 3])
	});
}

/** @description Verifies text/bytes are fully consumed and returned inside frozen evidence. @returns {Promise<void>} */
async function verifyHealthyBodies() {
	const textResult = await fetchTextBounded(
		revealHealthyResponse,
		"https://awtsmoos.test/page",
		100
	);
	const byteResult = await fetchBytesBounded(
		revealHealthyResponse,
		"https://awtsmoos.test/asset",
		100
	);
	assert.equal(textResult.body, "BH");
	assert.equal(byteResult.body.byteLength, 3);
	assert.equal(Object.isFrozen(textResult), true);
	assert.equal(Object.isFrozen(byteResult), true);
}

/** @description Verifies invalid timeout values fail before an unbounded release request can begin. @returns {Promise<void>} */
async function verifyInvalidTimeout() {
	await assert.rejects(
		fetchTextBounded(revealHealthyResponse, "https://awtsmoos.test/", 0),
		/compact_prewarm_timeout_invalid/
	);
}

/** @description Returns successful headers whose body rejects only when the supplied AbortSignal fires. @param {unknown} _url Unused URL. @param {object} options Fetch options. @returns {Promise<object>} Stalled response double. */
async function revealStalledBody(_url, options) {
	return {
		ok: true,
		status: 200,
		headers: new Headers(),
		text() {
			return new Promise(function awaitAbort(_resolve, reject) {
				function rejectAfterAbort() {
					reject(options.signal.reason || new Error("aborted"));
				}
				options.signal.addEventListener("abort", rejectAfterAbort, { once: true });
			});
		}
	};
}

/** @description Proves the timeout remains armed after headers until a stalled body is aborted. @returns {Promise<void>} */
async function verifyBodyTimeout() {
	const started = Date.now();
	await assert.rejects(
		fetchTextBounded(revealStalledBody, "https://awtsmoos.test/stall", 25)
	);
	assert.ok(Date.now() - started < 500);
}

test("bounded prewarm HTTP consumes healthy text and byte bodies", verifyHealthyBodies);
test("bounded prewarm HTTP rejects invalid timeout policy", verifyInvalidTimeout);
test("bounded prewarm HTTP aborts a body stalled after headers", verifyBodyTimeout);
