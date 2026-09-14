//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file HTTP overload admission tests.
 * @description
 * The Awtsmoos proves finite worker capacity rejects optional excess first while
 * preserving a measured reserve for Torah and static public reads.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { EventEmitter } = require("node:events");
const {
	createHttpAdmission,
	isCriticalRead
} = require("../httpAdmission.js");

/** Creates a response that records rejection while exposing Node lifecycle events. */
function responseVessel() {
	const response = new EventEmitter();
	response.writeHead = (statusCode, headers) => {
		response.statusCode = statusCode;
		response.headers = headers;
	};
	response.end = body => {
		response.body = body;
		response.emit("finish");
	};
	return response;
}

/** Creates one minimal request with explicit method and path. */
function request(method, url) {
	return { method, url };
}

test("Torah and static GET routes receive critical-read priority", () => {
	assert.equal(isCriticalRead(request("GET", "/heichelos/ikar")), true);
	assert.equal(isCriticalRead(request("HEAD", "/style/app.css")), true);
	assert.equal(isCriticalRead(request("POST", "/heichelos/ikar")), false);
	assert.equal(isCriticalRead(request("GET", "/api/social/feed")), false);
});

test("optional excess receives retryable 503 before critical reserve is consumed", () => {
	const admission = createHttpAdmission({
		AWTSMOOS_HTTP_MAX_INFLIGHT: "2",
		AWTSMOOS_HTTP_CRITICAL_MAX_INFLIGHT: "3"
	});
	const first = responseVessel();
	const second = responseVessel();
	assert.equal(admission.handle(request("GET", "/api/a"), first), false);
	assert.equal(admission.handle(request("GET", "/api/b"), second), false);
	const rejected = responseVessel();
	assert.equal(admission.handle(request("GET", "/api/c"), rejected), true);
	assert.equal(rejected.statusCode, 503);
	assert.equal(rejected.headers["Retry-After"], "1");
	const critical = responseVessel();
	assert.equal(admission.handle(request("GET", "/heichelos/ikar"), critical), false);
	const criticalRejected = responseVessel();
	assert.equal(
		admission.handle(request("GET", "/heichelos/ikar/series/bereishis"), criticalRejected),
		true
	);
	assert.equal(admission.snapshot().inFlight, 3);
	first.emit("finish");
	assert.equal(admission.snapshot().inFlight, 2);
	first.emit("close");
	assert.equal(admission.snapshot().inFlight, 2);
	second.emit("finish");
	critical.emit("finish");
	assert.equal(admission.snapshot().inFlight, 0);
	assert.equal(admission.snapshot().rejected, 2);
});
