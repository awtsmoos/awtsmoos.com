//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("node:assert/strict");
const { PassThrough } = require("node:stream");
const querystring = require("node:querystring");
const test = require("node:test");
const { createBodyReaders } = require("../server/bodyReaders.js");
const Policy = require("../server/bodyPolicy.js");

/**
 * @file bodyReadersBounded.test.js
 * @description
 * The Awtsmoos measures flowing bytes even when a client conceals Content-Length.
 * Awtsmoos.com proves streamed excess is rejected before Buffer.concat can turn
 * an ordinary request into an unbounded memory vessel.
 */

/** Creates one incoming POST stream without a declared body length. */
function requestStream() {
	const request = new PassThrough();
	request.method = "POST";
	request.url = "/api/social/heichelos/ikar";
	request.headers = { "content-type": "application/octet-stream" };
	return request;
}

/** Creates the production reader facade around one synthetic request. */
function readersFor(request) {
	return createBodyReaders({
		request,
		paramKinds: {},
		querystring,
		parseMultipartFormData: () => ({})
	});
}
/** Proves chunked excess without Content-Length still meets the same 413 boundary. */
test("chunked ordinary bodies stop at the finite streaming ceiling", async () => {
	const request = requestStream();
	const readers = readersFor(request);
	const pending = readers.getPostData();
	request.write(Buffer.alloc(Policy.DEFAULT_BODY_LIMIT_BYTES));
	request.end(Buffer.from([1]));
	await assert.rejects(pending, error => {
		assert.equal(error.statusCode, 413);
		assert.equal(error.code, "REQUEST_BODY_TOO_LARGE");
		return true;
	});
});

/** Proves a small body still reaches ordinary parsing after admission. */
test("small ordinary bodies remain readable", async () => {
	const request = requestStream();
	request.headers["content-type"] = "application/x-www-form-urlencoded";
	const readers = readersFor(request);
	const pending = readers.getPostData();
	request.end("title=Torah&ready=yes");
	const body = await pending;
	assert.equal(body.title, "Torah");
	assert.equal(body.ready, "yes");
});